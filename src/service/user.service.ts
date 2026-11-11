import { Provide } from '@midwayjs/core';
import { BaseService } from '@cicctencent/midwayjs-base';
import { InjectDataSource, } from '@midwayjs/typeorm';
import { DataSource, FindManyOptions, Like, Repository } from 'typeorm';
import User from '../model/user.entity'; // 引入用户模型
import { EEnable } from '@cicctencent/common/dist/models/account/user';
import * as md5 from 'blueimp-md5';

// 分页请求参数类型
interface PageRequest {
  page?: number;
  size?: number;
  query?: {
    account?: string;
    name?: string;
    mobile?: string;
    email?: string;
    enable?: EEnable;
    filter?: string; // 模糊搜索关键词
  };
}

// 分页响应类型
interface PageResponse {
  data: User[];
  total: number;
  page?: number;
}

@Provide()
export class UserService extends BaseService {
  @InjectDataSource('default') // 默认数据源名称
  dataSource: DataSource;

  private userModel: Repository<User>;

  // 模型类型定义为User
  get model() {
    if(this.userModel) return this.userModel;
    return this.userModel = this.dataSource.getRepository(User);
  }

  /**
   * 查询用户列表（支持分页、筛选、搜索）
   */
  async search(req: PageRequest): Promise<PageResponse> {
    const options: FindManyOptions<User> = {
      select: [
        'id',
        'name',
        'account',
        'mobile',
        'email',
        'avatar',
        'enable',
        'role',
        'createTime',
        'modifyTime',
        'updater',
        'creator'
      ],
      where: {},
      order: { modifyTime: 'DESC' }
    };

    // 处理筛选条件
    const { query } = req;
    if (query) {
      // 启用状态筛选
      if (query.enable !== undefined && query.enable > -1) {
        // @ts-ignore
        options.where.enable = query.enable;
      }
      // 账号精确筛选
      if (query.account) {
        // @ts-ignore
        options.where.account = query.account;
      }
      // 手机号精确筛选
      if (query.mobile) {
        // @ts-ignore
        options.where.mobile = query.mobile;
      }
      // 邮箱精确筛选
      if (query.email) {
        // @ts-ignore
        options.where.email = query.email;
      }
      // 名称模糊筛选
      if (query.name) {
        // @ts-ignore
        options.where.name = Like(`%${query.name}%`);
      }
    }

    // 处理分页
    const page = req.page || 1;
    const size = req.size > 1000 ? 1000 : (req.size || 10); // 限制最大页大小
    options.skip = (page - 1) * size;
    options.take = size;

    // 构建查询器（支持多字段模糊搜索）
    let queryBuilder = this.model.createQueryBuilder('user').setFindOptions(options);
    
    // 多字段模糊搜索
    if (query?.filter) {
      queryBuilder.andWhere(
        'user.account LIKE :filter OR user.name LIKE :filter OR user.mobile LIKE :filter OR user.email LIKE :filter',
        { filter: `%${query.filter}%` }
      );
    }

    // 执行查询
    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      data: entities,
      total,
      page
    };
  }

  /**
   * 验证账号密码（登录验证）
   * @param account 账号
   * @param password 密码
   * @returns 用户信息（验证成功）/null（验证失败）
   */
  async verifyAccount(account: string, password: string): Promise<User | null> {
    if (!account || !password) {
      throw new Error('账号和密码不能为空');
    }

    // 计算加密密码
    const encryptedPwd = this.encryptPassword(account, password);
    console.log(account, encryptedPwd);

    // 查询启用状态的用户
    return this.model.findOne({
      where: {
        account,
        password: encryptedPwd,
        enable: EEnable.ENABLE
      }
    });
  }

  /**
   * 创建用户
   * @param userData 用户信息
   * @param password 密码
   * @returns 创建的用户
   */
  async create(userData: Partial<User>, password: string): Promise<User> {
    // 参数校验
    if (!userData.account) {
      throw new Error('账号不能为空');
    }
    if (userData.account.length < 4) {
      throw new Error('账号长度至少4个字符');
    }
    if (!password) {
      throw new Error('密码不能为空');
    }
    if (password.length < 6) {
      throw new Error('密码长度至少6位');
    }

    // 检查账号是否已存在
    const existingUser = await this.model.findOneBy({ account: userData.account });
    if (existingUser) {
      throw new Error(`账号${userData.account}已存在`);
    }

    // 创建用户实体
    const user = new User();
    Object.assign(user, userData);
    user.password = this.encryptPassword(user.account, password); // 加密密码
    user.enable = user.enable ?? EEnable.ENABLE; // 默认启用

    
    user.updater = user.creator = this.ctx.currentSession?.loginId || '';

    return this.model.save(user);
  }

  /**
   * 修改用户信息（非密码字段）
   * @param id 用户ID
   * @param updateData 要更新的字段
   * @returns 更新后的用户
   */
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    if (!id) {
      throw new Error('用户ID不能为空');
    }

    // 检查用户是否存在
    const user = await this.model.findOneBy({ id });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 禁止直接修改密码（通过专门的修改密码方法）
    const { password, account, creator,updater,createTime,modifyTime, ...safeData } = updateData;
    // 更新字段
    Object.assign(user, safeData);
    user.updater = this.ctx.currentSession?.loginId || '';

    return this.model.save(user);
  }

  /**
   * 修改密码
   * @param id 用户ID
   * @param oldPassword 旧密码（非管理员必填）
   * @param newPassword 新密码
   * @param isAdmin 是否管理员（管理员可跳过旧密码验证）
   * @returns 是否修改成功
   */
  async updatePassword(
    id: string,
    newPassword: string,
    oldPassword?: string,
    isAdmin: boolean = false
  ): Promise<boolean> {
    if (!id || !newPassword) {
      throw new Error('用户ID和新密码不能为空');
    }
    if (newPassword.length < 6) {
      throw new Error('新密码长度至少6位');
    }

    const user = await this.getUserByAccount(id)
    if (!user) {
      throw new Error('用户不存在');
    }

    // 非管理员需要验证旧密码
    if (!isAdmin) {
      if (!oldPassword) {
        throw new Error('旧密码不能为空');
      }
      const encryptedOldPwd = this.encryptPassword(user.account, oldPassword);
      if (user.password !== encryptedOldPwd) {
        throw new Error('旧密码不正确');
      }
    }

    // 更新密码
    user.password = this.encryptPassword(user.account, newPassword);
    
    user.updater = this.ctx.currentSession?.loginId || '';

    await this.model.save(user);
    return true;
  }

  /**
   * 根据ID查询用户详情
   * @param id 用户ID
   * @returns 用户信息
   */
  async getUserById(id: number): Promise<User | null> {
    if (!id) {
      throw new Error('用户ID不能为空');
    }
    return this.model.findOneBy({ id });
  }

  /**
   * 根据账号查询用户详情
   * @param account 用户账号
   * @returns 用户信息
   */
  async getUserByAccount(account: string): Promise<User | null> {
    if (!account) {
      throw new Error('用户账号不能为空');
    }
    return this.model.findOneBy({ account });
  }

  // 校验是否为管理员
  async checkManager(account?: string): Promise<boolean> {
    let user: User;
    if(account) {
      user = await this.getUserByAccount(account);
    }
    else {
      user = await this.getUserById(this.ctx.currentSession.userId);
    }
    return user?.role === 'admin';
  }

  /**
   * 管理员账号播种：确保 managerAccounts 中的账号存在，缺失则创建（初始密码 defaultPassword）
   * 由 initializers/user-seed.initializer.ts 在启动时调用，幂等。
   * @param managerAccounts 管理员账号列表
   * @param defaultPassword 初始密码（未配置则跳过创建并告警）
   */
  async ensureManagerAccountsSeeded(
    managerAccounts: string[],
    defaultPassword?: string
  ): Promise<void> {
    for (const account of managerAccounts) {
      const existing = await this.getUserByAccount(account);
      if (existing) continue;
      if (!defaultPassword) {
        console.warn(
          `[UserSeed] 管理员账号 ${account} 不存在且未配置 DEFAULT_ADMIN_PASSWORD，跳过创建`
        );
        continue;
      }
      const user = new User();
      user.account = account;
      user.name = account;
      user.password = this.encryptPassword(account, defaultPassword);
      user.enable = EEnable.ENABLE;
      user.role = 'admin';
      user.creator = user.updater = 'system';
      await this.model.save(user);
      console.log(`[UserSeed] 已创建管理员账号 ${account}`);
    }
  }

  /**
   * 密码加密（account + password 拼接后MD5）
   * @param account 账号
   * @param password 原始密码
   * @returns 加密后的密码
   */
  private encryptPassword(account: string, password: string): string {
    const str = [account, password].join('$'); // 固定拼接符增强安全性
    return md5(str);
  }
}
