import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import VAceEditor from "vue2-ace-editor";
import "brace/mode/javascript";
import "brace/theme/chrome";
import "brace/snippets/javascript";
import TaskConfig from '../../../model/taskConfig';
import {TaskState, TaskTimeSize} from '../../../model/taskConst';
import {cron} from 'vue-cron';
@Component({
    components: {
        VAceEditor,
        cron
    }
})
export default class Edit extends Vue {
    @Prop()
    private id: number = 0;

    private codeJSONOptions = {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: {
            name: 'javascript',
            json: true
        },
        lineWrapping: true,
        theme: 'base16-dark'
      };

    private taskData = {
        name: '',
        description: '',
        script: '',
        timeSize: TaskTimeSize.second,
        state: TaskState.init,
        timeValue: '',
        watcher: ''
    } as TaskConfig;
    // 任务脚本
    private taskScript = '';

    // 任务执行规则值，数字和时间之间切换可能会报错。这里做下处理
    get timeValue() {
        if(this.taskData.timeSize === TaskTimeSize.day || this.taskData.timeSize === TaskTimeSize.single) {

            if(/^\d+$/.test(this.taskData.timeValue)) {
                this.taskData.timeValue = '';
            }
            else if(this.taskData.timeSize === TaskTimeSize.single && !/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(this.taskData.timeValue)) {
                this.taskData.timeValue = '';
            }
            else if(this.taskData.timeSize === TaskTimeSize.day && !/^\d{2}:\d{2}:\d{2}$/.test(this.taskData.timeValue)) {
                this.taskData.timeValue = '';
            }
        }
        else if(!/^\d+$/.test(this.taskData.timeValue)) {

            this.taskData.timeValue = '1';
        }
        return this.taskData.timeValue;
    }
    set timeValue(v) {
        this.taskData.timeValue = v;
    }

    async mounted() {
        this.query(this.$route);
    }

    // 查询任务配置
    @Watch('$route')
    @Watch('id')
    async query(newRoute) {

        newRoute = newRoute || this.$route;
        const id = Number(newRoute.query?.id || 0) || this.id;
        if(id > 0) {
            const data = await this.$ajax.requestApi<any, any>({
                id: id
            }, {
                url: '/api/task/query'
            });
            console.log(data);
            if(data.ret == 0 && data.data?.length) {
                Object.assign(this.taskData, data.data[0]);
                this.taskScript = this.taskData.script;
            }
        }
        else {
            this.taskData.name = '';
            this.taskScript = this.taskData.script = '';
            this.taskData.description = '';
            this.taskData.timeSize = TaskTimeSize.second,
            this.taskData.state = TaskState.init,
            this.taskData.timeValue = '';
            this.taskData.watcher = '';

        }

        this.taskScript = this.taskScript || `
        console.log('开始demo');

        const options = {
          url: 'http://127.0.0.1:8082/api/console/proxy?path=_sql%3Fformat%3Djson%26pretty%3Dtrue&method=POST',
          method: 'POST',
          headers: {
          "kbn-version": "7.5.1"
          },
          data: {
            "query":"select left(\"timestamp\", 16) as the_time, count(\"cmdname\") as req_num  from \"jv-access-7.5.1-2020.11.10\"   where \"svr\"='AsyncHttpAccServer'  group by the_time  order by the_time asc",
            "time_zone": "Asia/Shanghai"
          }
        };

        const res = await ctx.helper.curl(options);


        if(res.rows) {
            const connection = await ctx.service.base.getConnection('db_jv_ba');
            const sql = 'insert into t_svr_req_data(req_time, req_num) values (?, ?)';
            const data = [];
            await connection.query(sql, [['2020-11-17 00:00', 12]]);
        }`;
    }

    async save() {
        if(!this.taskData.timeValue) {
            this.$message.error('请输入正确的执行时间');
            return false;
        }
        this.taskData.script = this.taskScript || '';
        const rsp = await this.$ajax.requestApi<any, any>(this.taskData, {
            url: '/api/task/save'
        });
        if(rsp.ret === 0) {
            this.$message.success('保存成功');
            setTimeout(()=>{
                this.$router.go(-1);
            }, 1000);
        }
    }

    // 执行方式列表
    get TimeTypeOptions() {

        const options = [] as any;
        for(let k in TaskTimeSize) {
            const v = Number(k);
            if(isNaN(v)) continue;
            options.push({
                label: this.getTimeTypeName(v),
                value: v
            });
        }
        return options;
    }

    // 获取执行方式文案
    getTimeTypeName(v) {
        switch(v) {
            case TaskTimeSize.single: {
                return '执行一次';
            }
            case TaskTimeSize.second: {
                return `按秒执行`;
            }
            case TaskTimeSize.minute: {
                return `按分执行`;
            }
            case TaskTimeSize.hour: {
                return `按小时执行`;
            }
            case TaskTimeSize.day: {
                return `每天`;
            }
            case TaskTimeSize.week: {
                return `每周`;
            }
            case TaskTimeSize.month: {
                return `每月`;
            }
        }
        return '';
    }
}
