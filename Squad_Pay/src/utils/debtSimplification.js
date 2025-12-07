/**
 * netBalances: { [userId]: number }
 * returns array of { fromUserId, toUserId, amount }
 */
function simplifyDebts(netBalances) {
  const debtors = [];
  const creditors = [];

  for (const [userId, balance] of Object.entries(netBalances)) {
    const b = parseFloat(balance);
    if (b < -0.01) debtors.push({ userId: parseInt(userId), amount: -b });
    else if (b > 0.01) creditors.push({ userId: parseInt(userId), amount: b });
  }

  // sort (optional)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const payAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount: parseFloat(payAmount.toFixed(2)),
    });

    debtor.amount -= payAmount;
    creditor.amount -= payAmount;

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return settlements;
}

module.exports = { simplifyDebts };
