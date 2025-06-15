<template>
  <div class="app-container">
    <div class="chart-container">
      <div id="barChart" style="width: 50%;height:500px;" />
      <div id="pieChart" style="width: 50%;height:500px;" />
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
      
      // 绘制柱状图
      barChart.setOption({
        title: {
          text: '各班级学生人数统计',
          left: 'center'
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
          data: classNames || ['暂无数据'],
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '学生人数',
            type: 'bar',
            data: classData || [],
            itemStyle: {
              color: function(params) {
                // 为每个班级生成不同的颜色
                const colorList = [
                  '#5470c6', '#91cc75', '#fac858', '#ee6666', 
                  '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
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
        title: {
          text: '学生性别比例统计',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['男生', '女生']
        },
        series: [
          {
            name: '性别比例',
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
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
.chart-container {
  display: flex;
  flex-direction: row;
  height: 500px;
}
</style>
