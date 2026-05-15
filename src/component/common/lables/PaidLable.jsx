import React from 'react'
import Index from '../../Index'
export default function PaidLable() {
  return (
    <div>
      <Index.Box className="admin-table-lable-flex">
            <Index.Box className='admin-paid-lable-dots admin-table-lable-dots'></Index.Box>
            <Index.Box className="admin-paid-lable admin-table-lable-main">Paid</Index.Box>
      </Index.Box>
    </div>
  )
}
