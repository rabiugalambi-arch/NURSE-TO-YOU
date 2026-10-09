import sys

content = open('src/components/AdminApp.tsx').read()

old_span = '''                  {p.isBusy ? (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Busy
                    </span>
                  )'''

new_span = '''                  {p.isBusy ? (
                    <div className="inline-flex flex-col ml-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Busy
                      </span>
                      {p.currentBookingId && (
                        <span className="text-[10px] text-orange-600 mt-1">ID: {p.currentBookingId.substring(0,6)}...</span>
                      )}
                    </div>
                  )'''

content = content.replace(old_span, new_span)
open('src/components/AdminApp.tsx', 'w').write(content)
