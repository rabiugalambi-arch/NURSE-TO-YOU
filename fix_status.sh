sed -i '428,436c\
                  {providerData?.locationEnabled || providerData?.lastLocationUpdate ? (\
                    <div className="space-y-1">\
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> Location: Active</div>\
                      <div className="text-xs text-gray-500 font-normal">Last updated: {new Date(providerData.locationUpdatedAt || providerData.lastLocationUpdate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>\
                    </div>\
                  ) : (\
                    <div className="text-gray-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Location: Not available</div>\
                  )}' src/components/ProviderApp.tsx
