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
          <form class="form" @keyup.enter="submit">
            <h1>欢迎登录</h1>
            <div class="input-group mb-3">
              <span class="input-group-text">
                <i class="bi bi-person"></i>
              </span>
              <input
                  ref="nameInput"
                  v-model="form.name"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="用户名"
                  autocomplete="true"
                  maxlength="50"
              >
            </div>
            <div class="input-group mb-3">
              <span class="input-group-text" @click="passwordTypeChange()" style="cursor: pointer;">
                <i class="bi" :class="passwordType!=='password' ? 'bi-eye-slash' : 'bi-eye'"></i>
              </span>
              <input
                  ref="passwordInput"
                  v-model="form.password"
                  :type="passwordType"
                  class="form-control form-control-lg"
                  placeholder="密码"
                  name="password"
                  maxlength="50"
              >
            </div>
  
            <button type="button" class="btn btn-primary btn-lg w-100" :disabled="form.loading" @click="submit">
              <span v-if="form.loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, getCurrentInstance, ref, reactive } from 'vue'
  import config from '@/base/config';
  import {sysConfig} from '@/domain/SysConfig';
  import loginLeftPng from '@/assets/login/left.jpg';
  import { login } from '@/service/login';
  import toastPlugin, { type ToastType } from '@/components/toast/index';
  
  export default defineComponent({
    setup() {
    const systemTitle = sysConfig.title;
    const accountKey = 'school/login/account';
    const instance = getCurrentInstance();
    const $toast = instance?.appContext.config?.globalProperties?.$toast as ToastType;
    
      const form = reactive({
        name: localStorage.getItem(accountKey) || '',
        password: '',
        loading: false
      })
      const passwordType = ref('password')
      const passwordTypeChange = () => {
        passwordType.value === '' ? passwordType.value = 'password' : passwordType.value = ''
      }
      const passwordInput = ref<HTMLInputElement | null>(null);
      const nameInput = ref<HTMLInputElement | null>(null);

      const checkForm = () => {
        if (!form.name) {
          $toast?.warning('用户名不能为空');
          nameInput.value?.focus();
          return false;
        }
        if (!form.password) {
          $toast?.warning('密码不能为空');
          passwordInput.value?.focus();
          return false;
        }
        return true;
      }
      const submit = async () => {
        if (!checkForm()) return;
        form.loading = true;
        try {
          const res = await login(form.name, form.password);
          if(res?.ret === 0) {
            $toast?.success('登陆成功, 跳转中...');

            // 缓存
            localStorage.setItem(accountKey, form.name);

            setTimeout(()=>{
                const url = `${location.origin}${config.prefix}/admin/home`;
                location.replace(url);
            }, 1000);
          }
          else {
            $toast?.error(res?.msg || '登陆失败');
          }
        }
        catch(e: any) {
          // 接口异常（网络错误、账号服务不可用等）必须提示用户，否则只看到按钮 loading 无反馈
          console.error('登录失败', e);
          $toast?.error(e?.msg || '登陆失败, 请稍后重试');
        }
        finally {
          form.loading = false;
        }
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
          .input-group {
            margin-bottom: 20px;
          }
  
          .input-group-text {
            cursor: pointer;
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
  