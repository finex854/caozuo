<template>
  <div class="app-container">
  <div id="main" style="width: 100%;height:800px;" />
    <!-- ECharts will render here -->
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  mounted() {
    this.initChart(); // 确保 DOM 已挂载
  },
  methods: {
    initChart() {

// 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'))
// 绘制图表
      myChart.setOption({
        title: {
          text: '员工信息'
        },
        tooltip: {},
        xAxis: {
          data: ['讲师', '工程师', '', '班主任', '行政', '其他']
        },
        yAxis: {},
        series: [
          {
            name: '人数',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      })
    }
  }
}

</script>

