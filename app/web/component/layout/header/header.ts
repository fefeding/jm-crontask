import './header.css';
import LeftMenu from '../menu/menu.vue';
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
    components: {
        LeftMenu
    }
})
export default class Header extends Vue {
    // 菜单收缩标记
    get collapse(): boolean {
        return this.$store.state.collapse;
    }
    set collapse(v) {
        this.$store.state.collapse = v;
    }

    // 当前登录用户
    get loginUser() {
        return this.$store.state.loginUser || {};
    }

    site: any = {
        name: this.$store.state.title || ''
     };
    logout() {
        let url = '/account/login/logout?jvAppId=';
        if(this.$store.state.common) {
            url = this.$store.state.common.main.logoutUrl;
            url += '?jvAppId=' + this.$store.state.common.jvAppId;
        }
        window.location.replace(url + '&url=' + encodeURIComponent(location.href));
    }
}
