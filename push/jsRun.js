/** @param {NS} ns */

const file2read = 'hostsObj.script'
const file_autoAttack = 'autoAttack.js'

// run all autoAttack.js and target to hosts recored on hostsObj automatically;
export async function main(ns) {
  ns.clearLog()
  var scrt = ns.args[0];
  // clear port
  while (ns.readPort(1) != 'NULL PORT DATA') {
    await ns.sleep(1);
  }
  // sulutions
  switch (scrt) {
    case file_autoAttack:
      autoAttack(ns);
      break;
    default:
      ns.print('!!! Script name ERROR!')
      break;
  }
}


function autoAttack(ns) {
  ns.print('-------------------- autoAttack --------------------')
  var json = JSON.parse(ns.read(file2read));
  var hosts =
      json.accessedHosts.reverse();  // start from js that need least ram
  for (let i = 0; i < hosts.length; ++i) {
    var target = hosts[i];
    if (ns.getServerMaxMoney(target) == 0) {
      ns.tprint('!!! No money: ', target);
      continue;
    }
    ns.print('=== target: ', target);
    if (ns.isRunning(file_autoAttack, ns.getHostname(), target)) {
      ns.kill(file_autoAttack, ns.getHostname(), target);
    }
    ns.run(file_autoAttack, 1, target);
  }
}
