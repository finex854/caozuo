<template>
  <div class="app-container report-container">
    <div class="chart-title">员工职位分布统计</div>
    <div id="main" style="width: 100%;height:600px;" />
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
      
      // 自定义颜色
      const colors = ['#5470c6', '#91cc75', '#ee6666', '#73c0de']
      
      // 绘制图表
      myChart.setOption({
        backgroundColor: '#ffffff',
        title: {
          text: '员工职位分布',
          subtext: '按各部门职位统计',
          left: 'center',
          textStyle: {
            fontSize: 20,
            color: '#333'
          },
          subtextStyle: {
            fontSize: 14,
            color: '#666'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          formatter: '{b}: {c}人'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: jobNames || ['班主任', '讲师', '学工主管', '教研主管'],
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666',
            fontSize: 14,
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '人数',
          nameTextStyle: {
            color: '#666',
            fontSize: 14
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666',
            fontSize: 12
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee'
            }
          }
        },
        series: [
          {
            name: '职位人数',
            type: 'bar',
            data: jobData || [],
            barWidth: '40%',
            itemStyle: {
              color: function(params) {
                return colors[params.dataIndex % colors.length]
              },
              borderRadius: [5, 5, 0, 0],
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}人',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            animationType: 'scale',
            animationDelay: function (idx) {
              return idx * 100
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

<style scoped>
.report-container {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 20px;
}
</style>

