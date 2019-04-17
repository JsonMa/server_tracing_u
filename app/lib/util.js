// 检测是否是电话号码
function telCheck (tel) {
  return /^\d{7,11}$/g.test(tel)
}

// 检测是否是邮箱
function emailCheck (email) {
  return /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/g.test(email)
}

module.exports = {
  telCheck, emailCheck
}
