import { Vue } from 'vue-property-decorator';
export default class Content extends Vue {
    // 菜单收缩标记
    get collapse(): boolean {
        return this.$store.state.collapse;
    }
    set collapse(v) {
        this.$store.state.collapse = v;
    }
}
