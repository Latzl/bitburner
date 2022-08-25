// From VSCode
import * as allin from './src/allin'

const hostsObjFile = '/src/hostsObj.script';
const runFiles = ['autoAttack.js'];


const copyfrom = 'home';

// copy attack files: hack grow weaken to server;
export async function main(ns) {
  ns.tprint('>>> copyAttack.js running...');
  const files = allin.getFiles(ns, '/src/attackFiles.script');
  const srcFiles = allin.getFiles(ns, '/src/srcFiles.script');
  if (ns.args.length > 0) {
    ns.print('--------------- To selected ---------------')
    var hosts = ns.args;
  } else {
    ns.print('--------------- To all ---------------')
    var hostsObj = JSON.parse(ns.read(hostsObjFile));
    var hosts = hostsObj.accessedHosts
    hosts = hosts.concat(hostsObj.myHosts)
  }
  for (var i = 0; i < hosts.length; ++i) {
    ns.print('=== Attack/ copy to ', hosts[i]);
    await ns.scp(files, hosts[i], copyfrom);
    await ns.scp(srcFiles, hosts[i], copyfrom);
    await ns.scp(
        runFiles, hosts[i], copyfrom);  // autoAttack run on targetHost;
  }
  ns.tprint('<<< copyAttack.js finished');
}
