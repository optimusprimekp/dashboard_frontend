import React from 'react'
import Index from '../../Index'

export default function PendingLable() {
  return (
    <div>
      <Index.Box className="admin-table-lable-flex">
        <Index.Box className='admin-pending-lable-dots admin-table-lable-dots'></Index.Box>
        <Index.Box className="admin-pending-lable admin-table-lable-main">Pending</Index.Box>
      </Index.Box>
    </div>
  )
}
