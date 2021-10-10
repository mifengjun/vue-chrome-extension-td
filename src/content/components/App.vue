<template>
  <div v-if="show" id="OvertimeClockIn">
    <el-popconfirm
        title="确认一下打卡时间？"
        @confirm="overtimeClockIn"
    >
      <el-button slot="reference" plain type="primary" size="mini" :loading="loading" >
        {{ buttonTitle }}
      </el-button>
    </el-popconfirm>
  </div>
</template>

<script>
import config from "../../config";

export default {
  name: "App",

  components: {},

  data() {
    return {
      connect: chrome.runtime.connect({name: 'chrome-extendsion-connect'}),
      user: null,
      show: false,
      loading: false,
      buttonTitle: "加班辛苦了，先打个卡吧"
    };
  },

  methods: {
    overtimeClockIn() {
      this.loading = true;
      this.connect.postMessage({functionName: "overtimeClockIn"});
    },

    overtimeClockInResult(res) {
      this.loading = false;
      if (!res.data.data.success) {
        this.buttonTitle = res.data.data.msg;
      } else {
        this.buttonTitle = "打卡成功，早点休息，明天会更好~";
        setTimeout(() => {
          this.show = false;
        }, 2000);
        this.$message({
          message: "打卡成功，早点休息，明天会更好~",
          type: "success"
        });
      }
    },

    showAndHide(msg) {
      if (msg.data.data.success && !(msg.data.data.data.list.length > 0)) {
        this.show = true;
      }
    }
  },

  computed: {},

  mounted() {
    if (new Date().getHours() >= config.Hour) {
      this.connect.postMessage({functionName: "getOvertimeClockIn"});
      const that = this;
      this.connect.onMessage.addListener(function (msg) {
        console.log(msg);
        switch (msg.name) {
          case "getOvertimeClockIn":
            that.showAndHide(msg);
            break;
          case "overtimeClockIn":
            that.overtimeClockInResult(msg);
            break;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
#OvertimeClockIn {
  position: fixed;
  left: 0;
  top: 130px;
  z-index: 9999;
}
</style>
