// From VSCode
import * as allin from './allin'

const file2read = 'hostsObj.script'
const copyfrom = 'home';
export async function main(ns) {
  ns.tprint('>>> copyAttack.js running...');
  const files = allin.getFiles(ns, 'attackFiles.script')
  if (ns.args.length > 0) {
    ns.print('--------------- To selected ---------------')
    var hosts = ns.args;
  }
  else {
    ns.print('--------------- To all ---------------')
    var json = JSON.parse(ns.read(file2read));
    var hosts = json.accessedHosts
    hosts = hosts.concat(json.myHosts)
  }
  for (var i = 0; i < hosts.length; ++i) {
    ns.print('=== Attack/ copy to ', hosts[i]);
    await ns.scp(files, hosts[i], copyfrom);
  }
  ns.tprint('<<< copyAttack.js finished');
}
