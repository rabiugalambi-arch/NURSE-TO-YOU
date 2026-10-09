const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

content = content.replace(
  `      setStep('success');
    } catch (err: any) {`,
  `      triggerNotification('booking-success-' + Date.now(), 'Booking Submitted', 'Booking submitted successfully.', 'success');
      setStep('success');
    } catch (err: any) {`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
