import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import TaskInstanceORM from '../../../model/taskInstance';
import {TaskState, TaskStatus, TaskTimeSize} from '../../../model/taskConst';

@Component({
    components: {
        
    }
})
export default class Edit extends Vue {
    
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

    private instance = {
        log: '',
        execStartTime: '',
        execEndTime: '',
        status: TaskStatus.init
    } as TaskInstanceORM;

    private logLines = [];

    async mounted() {  
        this.query();
    }

    // 查询运行详情
    async query() {
        
        const id = Number(this.$route.query?.id || 0);
        if(id > 0) {
            const data = await this.$ajax.requestApi<any, any>({
                id: id
            }, {
                url: '/api/instance/get'
            });
            console.log(data);
            if(data.ret == 0 && data.data) {
                
                 Object.assign(this.instance, data.data);                
                this.logLines = data.data.log?.split('\n');
            }
        }
    }
}