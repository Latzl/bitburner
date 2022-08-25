/** @param {NS} ns */

// return array of files include path, use for fileread which include other
// files' name and their common path; e.g.attackFiles.script
export function getFiles(ns, file_in) {
  ns.print('=== getFiles() calling...');
  var obj = JSON.parse(ns.read(file_in));
  var out = [];
  // ns.tprint(obj);
  for (let i = 0; i < obj.files.length; ++i) {
    out.push(obj.dir + obj.files[i]);
  }
  ns.print('=== getFiles() out with: ', out);
  return out;
}


export function bitFix(byte) {
  if (byte < 1024)
    return byte.toFixed(2) + 'GB';
  else if ((byte /= 1024) < 1024)
    return byte.toFixed(2) + 'TB';
  else if ((byte /= 1024) < 1024)
    return byte.toFixed(2) + 'PB';
  else
    return 'NaN';
}

export function moneyFix(value) {
  if (value < 1e3)
    return value.toFixed(3);
  else if ((value /= 1e3) < 1e3)
    return value.toFixed(3) + 'k';
  else if ((value /= 1e3) < 1e3)
    return value.toFixed(3) + 'm';
  else if ((value /= 1e3) < 1e3)
    return value.toFixed(3) + 'b';
  else if ((value /= 1e3) < 1e3)
    return value.toFixed(3) + 'p';
  else
    return 'NaN';
}

// return sorted tarr_in according to arr_in
export function sort(arr_in, tarr_in = [], descending = 0) {
  var arr = _.cloneDeep(arr_in), tarr = _.cloneDeep(tarr_in);
  var len = arr.length, tarrIn = tarr.length > 0;
  do {
    var sorted = true;
    for (let i = 1; i < len; ++i) {
      if (descending ? arr[i] >= arr[i - 1] : arr[i] < arr[i - 1]) {
        sorted = false;
        arr.splice(i - 1, 0, arr.splice(i, 1)[0]);
        if (tarrIn) tarr.splice(i - 1, 0, tarr.splice(i, 1)[0]);
      }
    }
    --len;
  } while (!sorted && len > 1)
  return tarrIn ? tarr : arr;
}

// remove element, which arrDel include, from arr
export function removeArr(arr, arrDel) {
  for (let j = 0; j < arrDel.length; ++j) {
    for (let i = 0; i < arr.length;) {
      if (arr[i] == arrDel[j]) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
  }
  return arr;
}