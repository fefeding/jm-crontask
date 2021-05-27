import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Menu extends Vue {
    @Prop() private collapse: boolean = false;
    private menu: any = {
        home: {
            name: '任务配置',
            path: '/task/list',
            icon: 'el-icon-menu'
        },
        task: {
            name: '任务实例',
            path: '/task/instance',
            icon: 'el-icon-menu'
        }
    };
    private handleOpen(key: string, keyPath: string) {
        console.log(key, keyPath);
    }
    private handleClose(key: string, keyPath: string) {
        console.log(key, keyPath);
    }
}
