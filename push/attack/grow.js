/** @param {NS} ns */
export async function main(ns) {
  var sourceHost = ns.getHostname();
  var targetHost = ns.args[0];
  var sendstr =
      JSON.stringify({'sourceHost': sourceHost, 'targetHost': targetHost});
  await ns.grow(targetHost);
  await ns.writePort(1, sendstr);
}