<template>
  <div class="app-container report-container">
    <div class="chart-title">学生信息统计报表</div>
    <div class="chart-container">
      <div class="chart-box">
        <div class="chart-subtitle">班级人数分布</div>
        <div id="barChart" />
      </div>
      <div class="chart-box">
        <div class="chart-subtitle">男女比例</div>
        <div id="pieChart" />
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'

export default {
  data() {
    return {
      chartData: {
        classNames: [],
        classData: [],
        genderStats: {
          男: [],
          女: []
        }
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      request({
        url: '/report/student/class',
        method: 'get'
      }).then(response => {
        console.log('学生统计数据:', response)
        if (response.data && response.data.data) {
          this.chartData = response.data.data
        } else {
          console.error('返回数据格式不正确:', response)
        }
        this.initBarChart()
        this.initPieChart()
      }).catch(error => {
        console.error('获取学生统计数据失败:', error)
      })
    },
    initBarChart() {
      // 基于准备好的dom，初始化echarts实例
      const barChart = echarts.init(document.getElementById('barChart'))

      // 准备数据
      const { classNames, classData } = this.chartData

      // 自定义颜色
      const colorList = [
        '#5470c6', '#91cc75', '#fac858', '#ee6666',
        '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
      ]

      // 绘制柱状图
      barChart.setOption({
        backgroundColor: '#ffffff',
        title: {
          text: '各班级学生人数统计',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333'
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
          formatter: '{b}<br/>学生人数: {c}人'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '12%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: classNames || ['暂无数据'],
          axisLabel: {
            interval: 0,
            rotate: 30,
            color: '#666',
            fontSize: 12
          },
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '人数',
          nameTextStyle: {
            color: '#666',
            fontSize: 12,
            padding: [0, 30, 0, 0]
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
            name: '学生人数',
            type: 'bar',
            data: classData || [],
            barWidth: '50%',
            itemStyle: {
              color: function (params) {
                return colorList[params.dataIndex % colorList.length]
              },
              borderRadius: [4, 4, 0, 0],
              shadowBlur: 5,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}人',
              fontSize: 12,
              fontWeight: 'bold'
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 15,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            animationType: 'scale',
            animationEasing: 'elasticOut'
          }
        ]
      })

      // 窗口大小变化时，重新调整图表大小
      window.addEventListener('resize', () => {
        barChart.resize()
      })
    },
    initPieChart() {
      // 基于准备好的dom，初始化echarts实例
      const pieChart = echarts.init(document.getElementById('pieChart'))

      // 准备数据
      const { genderStats } = this.chartData

      // 计算总的男女学生数量
      let totalMale = 0
      let totalFemale = 0

      if (genderStats && genderStats['男'] && genderStats['女']) {
        totalMale = genderStats['男'].reduce((sum, current) => sum + current, 0)
        totalFemale = genderStats['女'].reduce((sum, current) => sum + current, 0)
      }

      // 饼图数据
      const pieData = [
        { value: totalMale, name: '男生' },
        { value: totalFemale, name: '女生' }
      ]

      // 绘制饼图
      pieChart.setOption({
        backgroundColor: '#ffffff',
        title: {
          text: '学生性别比例统计',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal',
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: '5%',
          left: 'center',
          itemGap: 20,
          data: ['男生', '女生'],
          textStyle: {
            color: '#666',
            fontSize: 14
          },
          icon: 'circle'
        },
        color: ['#5470c6', '#ee6666'],
        series: [
          {
            name: '性别比例',
            type: 'pie',
            radius: ['40%', '70%'], // 环形图
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            },
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}人\n{d}%',
              fontSize: 14,
              fontWeight: 'bold'
            },
            labelLine: {
              show: true,
              smooth: true,
              length: 15,
              length2: 15
            },
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            animationType: 'scale',
            animationEasing: 'elasticOut'
          }
        ]
      })

      // 窗口大小变化时，重新调整图表大小
      window.addEventListener('resize', () => {
        pieChart.resize()
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

.chart-subtitle {
  font-size: 16px;
  color: #555;
  text-align: center;
  margin-bottom: 10px;
  font-weight: 500;
}

.chart-container {
  display: flex;
  flex-direction: row;
  height: 500px;
  gap: 20px;
}

.chart-box {
  flex: 1;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 15px;
  display: flex;
  flex-direction: column;
}

#barChart,
#pieChart {
  flex: 1;
  width: 100%;
}
</style>
