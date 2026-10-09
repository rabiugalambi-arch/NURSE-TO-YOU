import sys

content = open('src/components/ProviderApp.tsx').read()

old_duty = '''                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Duty Status
                    <span className={cn("w-2.5 h-2.5 rounded-full", providerData?.available ? "bg-teal-500 animate-pulse" : "bg-gray-400")}></span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Accepting new patient requests</p>
                </div>
                <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out shadow-sm",
                    providerData?.available ? "bg-teal-500" : "bg-gray-300"
                  )}'''

new_duty = '''                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Duty Status
                    <span className={cn("w-2.5 h-2.5 rounded-full", 
                      providerData?.isBusy ? "bg-orange-500 animate-pulse" : 
                      providerData?.available ? "bg-teal-500 animate-pulse" : "bg-gray-400"
                    )}></span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {providerData?.isBusy ? "Busy with an active request/booking" : 
                     providerData?.available ? "Accepting new patient requests" : "Currently offline"}
                  </p>
                </div>
                <button 
                  onClick={toggleAvailability}
                  disabled={providerData?.isBusy}
                  className={cn(
                    "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out shadow-sm",
                    providerData?.isBusy ? "bg-orange-300 opacity-50 cursor-not-allowed" :
                    providerData?.available ? "bg-teal-500" : "bg-gray-300"
                  )}'''

content = content.replace(old_duty, new_duty)
open('src/components/ProviderApp.tsx', 'w').write(content)
