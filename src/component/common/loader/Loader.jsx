import React from 'react'
import Index from '../../Index'

export default function Loader() {
      return (
            <Index.TableRow>
                  <Index.TableCell className='table-not-found-td' colSpan={12}>
                        <Index.Box class="loader-main">
                              <Index.Box class="loader">
                                    <span></span>
                                    <span></span>
                              </Index.Box>
                        </Index.Box>
                  </Index.TableCell>
            </Index.TableRow>
      )
}
