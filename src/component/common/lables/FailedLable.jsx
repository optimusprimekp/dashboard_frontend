import React from 'react'
import Index from '../../Index'

export default function FailedLable() {
  return (
    <div>
      <Index.Box className="admin-table-lable-flex">
        <Index.Box className='admin-failed-lable-dots admin-table-lable-dots'></Index.Box>
        <Index.Box className="admin-failed-lable admin-table-lable-main">Failed</Index.Box>
      </Index.Box>
    </div>
  )
}
