export default function TransactionItem({ tx }) {

  return (
    <div className="transaction-item">

      <div><b>{tx.type}</b></div>
      <div>{tx.amount}</div>
      <div>{new Date(tx.createdAt).toLocaleString()}</div>

    </div>
  )
}