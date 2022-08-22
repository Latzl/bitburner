/** @param {NS} ns */

const file2read = 'hostsObj.script'
const file_runAttack = 'runAttack.js'
const file_autoAttack = 'autoAttack.js'
export async function main(ns) {
  ns.clearLog()
  var scrt = ns.args[0];
  // clear port
  while (ns.readPort(1) != 'NULL PORT DATA') {
    await ns.sleep(1);
  }
  // sulutions
  switch (scrt) {
    case file_runAttack:
      runAttack(ns);
      break;
    case file_autoAttack:
      autoAttack(ns);
      break;
    default:
      ns.print('!!! Script name ERROR!')
      break;
  }
}

function runAttack(ns) {
  ns.print('-------------------- runAttack --------------------')
  var json = JSON.parse(ns.read(file2read));
  var hosts = json.accessedHosts
  var arr_mine = json.mine2accessed.sourceHost,
      arr_target = json.mine2accessed.targetHost
  for (let i = 0; i < arr_mine.length; ++i) {
    var source = arr_mine[i], target = arr_target[i];
    ns.print('=== source: ', source, '; target: ', target);
    ns.kill(file_runAttack, ns.getHostname(), source, target);
    ns.run(file_runAttack, 1, source, target);
  }
  for (let i = 0; i < hosts.length; ++i) {
    var target = hosts[i]
    ns.print('=== target: ', target);
    ns.kill(file_runAttack, ns.getHostname(), target);
    ns.run(file_runAttack, 1, target);
  }
}

function autoAttack(ns) {
  ns.print('-------------------- autoAttack --------------------')
  var json = JSON.parse(ns.read(file2read));
  var hosts = json.accessedHosts;
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
