<template>
  <div v-if="user">
    当前登录用户 {{ user.nickName }}

    <br>

    当前数据环境 {{ environment }}

    <br>

    当前时间 {{ date }} {{ time }}
    <el-popconfirm
        title="确认一下打卡时间？"
        @confirm="overtimeClockIn"

    >
      <el-button slot="reference" plain type="primary" size="mini" :loading="loading" :disabled="disabled">
        {{ overtimeClockInMsg }}
      </el-button>
    </el-popconfirm>
  </div>
  <div v-else>
    登录成功后刷新当前页
  </div>
</template>

<script>
import axios from "axios";
import config from "../../config.js"
import {getDate, getTime} from "../../utils/date";

export default {
  name: "App",

  components: {},

  data() {
    return {
      user: null,
      date: getDate(),
      time: getTime(),
      disabled: false,
      loading: false,
      environment: config.oaHost,
      overtimeClockInMsg: "加班打卡"
    };
  },

  methods: {

    getOvertimeClockIn() {
      var url = config.oaHost + "/api/proc/list/sent?pageNum=1&pageSize=20&filter=" + config.overtimeClockInFilter + "&start=" + this.date + "&end=" + this.date + "&pending=false"
      axios.get(url).then(response => {
        if (response.data.success && response.data.data.list.length > 0) {
          this.overtimeClockInMsg = "今日已打卡";
          this.disabled = true;
        } else {
          if (new Date().getHours() < config.Hour) {
            this.overtimeClockInMsg = "现在还不能打卡哦";
            this.disabled = true;
          }
        }
      });
    },

    overtimeClockIn() {
      var url = config.oaHost + "/api/proc/ru/submit";
      var paramData = {"reason": "加班", "workcode": this.user.jobNumber};
      var data = {"flowKey": "jbsq", "version": 37, "formKey": "default", "data": JSON.stringify(paramData)};
      this.loading = true;

      axios.post(url, data).then(response => {
        this.loading = false;
        if (response.data.success) {
          this.overtimeClockInMsg = "打卡成功";
          this.disabled = true;
          this.$message({
            message: "打卡成功，早点休息，明天会更好~",
            type: "success"
          });
        } else {
          this.overtimeClockInMsg = response.data.msg;
        }
      });
    },
    getCurrentUser() {
      var url = config.oaHost + "/api/auth/current";
      axios.get(url).then(response => {
        if (response.data.success) {
          this.user = response.data.data;
        } else {
          // 获取用户信息失败，需要登录，打开新的窗口登录，然后关掉窗口
          chrome.tabs.create({url: "http://janus-inner.tongdun.cn:8088/userLogin.htm?callbackUrl=" + config.oaHost + "/sso&tokenEncoding=true"});
        }
      });
    }
  },

  computed: {},

  mounted() {
    this.getCurrentUser();
    this.getOvertimeClockIn();
  }
};
</script>
