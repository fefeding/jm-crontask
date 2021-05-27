import { Vue, Component, Prop } from 'vue-property-decorator';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import MainLayout from './main/index.vue';
Vue.use(ElementUI);

@Component({
    name: 'Layout',
    components: {
        MainLayout
    }
})
export default class Layout extends Vue {
    @Prop({ type: String, default: 'egg' }) title?: string;
    @Prop({ type: String, default: 'Vue TypeScript Framework, Server Side Render' }) description?: string;
    @Prop({ type: String, default: 'Vue,TypeScript,Isomorphic' }) keywords?: string;

    isNode: boolean = EASY_ENV_IS_NODE;

    get justContent() {
        return this.$route.query.is_content == '1';
    }

    created() {
        console.log('>>EASY_ENV_IS_NODE create', EASY_ENV_IS_NODE);
    }
}
