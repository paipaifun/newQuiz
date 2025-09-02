// 获取URL参数
export const getUrlParamsByName = (name: string) => {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
};


export const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${monthNames[month - 1]} ${day}, ${year}`;
}

export const getCurrentDate2 = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
}