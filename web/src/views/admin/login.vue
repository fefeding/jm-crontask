<template>
    <div class="container">
      <div class="box">
        <div class="login-content-left">
          <img :src="loginLeftPng"/>
          <div class="login-content-left-mask">
            <div>{{ systemTitle }}</div>
            <!--<div>{{ systemSubTitle }}</div>-->
          </div>
        </div>
  
        <div class="box-inner">
          <el-form class="form" @keyup.native.enter="submit">
            <h1>欢迎登录</h1>
            <el-input
                size="large"
                ref="nameInput"
                v-model="form.name"
                placeholder="用户名"
                autocomplete="true"
                type="text"
                maxlength="50"
                clearable
            >
              <template #prepend>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
            <el-input
                size="large"
                ref="passwordInput"
                v-model="form.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                maxlength="50"
                clearable
            >
              <template #prepend>
                <el-icon @click="passwordTypeChange()"><Hide v-if="passwordType!=='password'" /><View v-else /></el-icon>
              </template>
            </el-input>
  
            <el-button type="primary" :loading="form.loading" @click="submit" style="width: 100%;" size="large">
              登录
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  //import router from '../router';
  import config from '@/base/config';
  import {sysConfig} from '@/domain/SysConfig';
  import loginLeftPng from '@/assets/login/left.jpg';
  import { login } from '@/service/login';
  
  export default defineComponent({
    setup() {
    const systemTitle = sysConfig.title;
    const accountKey = 'school/login/account';
    
      const form = reactive({
        name: localStorage.getItem(accountKey) || '',
        password: '',
        loading: false
      })
      const passwordType = ref('password')
      const passwordTypeChange = () => {
        passwordType.value === '' ? passwordType.value = 'password' : passwordType.value = ''
      }
      const passwordInput = ref({});
      const nameInput = ref({});

      const checkForm = () => {
        return new Promise((resolve, reject) => {
          if (!form.name) {
            ElMessage.warning({
              message: '用户名不能为空',
              type: 'warning'
            });
            // @ts-ignore
            nameInput.value.focus();
            return;
          }
          if (!form.password) {
            ElMessage.warning({
              message: '密码不能为空',
              type: 'warning'
            })
            // @ts-ignore
            passwordInput.value.focus();
            return;
          }
          resolve(true)
        })
      }
      const submit = () => {
        checkForm()
        .then(async () => {
          form.loading = true;
          const res = await login(form.name, form.password);
          if(res.ret === 0) {
            ElMessage.success('登陆成功, 跳转中...');

            // 缓存
            localStorage.setItem(accountKey, form.name);

            setTimeout(()=>{
                const url = `${location.origin}${config.prefix}/admin/index`;
                //const to = router.resolve('index');
                location.replace(url);
            }, 1000);
          }
          else {
            ElMessage.error(res.msg || '登陆失败');
          }
      }).finally(()=>{
        form.loading = false;
      });
    }

    console.log('systemTitle', systemTitle);
      return {
        systemTitle,
        nameInput,
        passwordInput,
        loginLeftPng,
        form,
        passwordType,
        passwordTypeChange,
        submit
      }
    }
  })
  </script>
  
  <style lang="scss" scoped>
  .container {
    position: relative;
    width: 100vw;
    max-width: 100%;
    height: 100vh;
    background: #fff url('@/assets/login/bg.png') no-repeat center;
    overflow: hidden;
    background-size: cover;
    backdrop-filter: blur(10px); /* 设置模糊程度 */
    cursor: pointer;
    user-select: none;
  
    .box {
      width: 1160px;
      display: flex;
      position: absolute;
      left: 50%;
      top: 50%;
      background: white;
      border-radius: 8px;
      transform: translate(-50%, -50%);
      height: 440px;
      overflow: hidden;
      box-shadow: 0 0 10px 2px #000;
  
      .login-content-left {
        position: relative;
  
        img {
          height: 440px;
        }
  
        .login-content-left-mask {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(rgba(0,204,222,0.8), rgba(51,132,224,0.8));
          text-align: center;
          color: #fff;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          letter-spacing: 2px;
  
          div:nth-child(1) {
            font-size: 3.5rem;
            margin-bottom: 1em;
          }
        }
      }
  
      .box-inner {
        width: 500px;
  
        .form {
          width: 80%;
          margin: 40% auto 0;
          translate: 0 -50%;
          h1 {
            margin-bottom: 20px;
            text-align: center;
          }
          .el-input {
            margin-bottom: 20px;
          }
  
          .password-icon {
            cursor: pointer;
            color: #409eff;
          }
        }
  
        .fixed-top-right {
          position: absolute;
          top: 10px;
          right: 10px;
        }
      }
    }
  }
  
  @media screen and (max-width: 1260px) {
    .login-content-left {
      display: none;
    }
    .box {
      width: 500px !important;
    }
  }
  
  @media screen and (max-width: 750px) {
    .container .box, .container .box-inner {
      width: 100vw !important;
      height: 100vh;
      box-shadow: none;
      left: 0;
      top: 0;
      transform: none;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  
      h1 {
        margin-top: 0;
      }
  
      .form {
      }
    }
  }
  </style>
  