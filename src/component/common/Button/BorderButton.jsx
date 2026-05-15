import React from 'react'
import Index from '../../Index'



export default function BorderButton(props) {
  return (
    <>
      <Index.Box className='border-btn-main'>
        <Index.Button className={props.className} onClick={props.onClick}>{props.btnLabel}</Index.Button>
      </Index.Box>


      {/* use this button like below demo */}
      {/* <Index.BorderButton btnLabel="View Button" className='border-btn'/> */}
    </>
  )
}