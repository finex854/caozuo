<template>
  <div class="app-container">
    <div id="main" style="width: 100%;height:600px;" />
    <!-- ECharts will render here -->
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'

export default {
  data() {
    return {
      chartData: {
        jobNames: [],
        jobData: []
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      request({
        url: '/report/emp/job',
        method: 'get'
      }).then(response => {
        console.log('员工统计数据:', response)
        if (response.data && response.data.data) {
          this.chartData = response.data.data
        } else {
          console.error('返回数据格式不正确:', response)
        }
        this.initChart()
      }).catch(error => {
        console.error('获取员工统计数据失败:', error)
      })
    },
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      const myChart = echarts.init(document.getElementById('main'))
      
      // 准备数据
      const { jobNames, jobData } = this.chartData
      
      // 绘制图表
      myChart.setOption({
        title: {
          text: '员工职位统计',
          subtext: '按职位分布'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: jobNames || ['班主任', '讲师', '学工主管', '教研主管']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '职位人数',
            type: 'bar',
            data: jobData || [],
            itemStyle: {
              color: function(params) {
                // 为每个职位生成不同的颜色
                const colorList = [
                  '#5470c6', '#91cc75', '#fac858', '#ee6666'
                ]
                return colorList[params.dataIndex % colorList.length]
              }
            },
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      })

      // 窗口大小变化时，重新调整图表大小
      window.addEventListener('resize', () => {
        myChart.resize()
      })
    }
  }
}
</script>

