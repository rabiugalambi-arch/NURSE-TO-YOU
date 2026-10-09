import re

with open('firestore.rules', 'r') as f:
    content = f.read()

old_rule = """        ) ||
          // Allow clients to update isBusy and currentBookingId when creating a booking 
         (request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isBusy', 'currentBookingId']));"""

new_rule = """        ) ||
          // Allow clients to update isBusy and currentBookingId when creating a booking 
         (request.auth != null && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['verified', 'applicationStatus', 'providerId', 'phone', 'email'])));"""

content = content.replace(old_rule, new_rule)

with open('firestore.rules', 'w') as f:
    f.write(content)
