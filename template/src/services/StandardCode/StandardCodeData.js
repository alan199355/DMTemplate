import { openBuildService } from '../../helper/service'

// 值类型为String或Object,String为url(method),Object同axios(config)参数支持相同,data和params只能为对象类型
const settings = {
  // 获取标准码数据
  getStandardCodeData: {
    url: '/api/v1/config/code/get_codelist',
    method: 'post'
  },
  //获取单位类型
  getCompanyList: {
    url: '/api/v1/org/company/get_list',
    method: 'get'
  },
  //获取oss地址
  getOssAddress: {
    url: '/api/v1/base/third_app/get_third_app_detail',
    method: 'post'
  }
}

export default openBuildService(settings)
