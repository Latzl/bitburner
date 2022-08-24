/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  const port = 1;
  var str = ns.peek(port);
  while (true) {
    ns.print(str = ns.peek(port));
    await ns.sleep(200);
  }
}