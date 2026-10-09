import re

with open('src/components/MenstrualTracker.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''    } catch (e) {
      console.error(e);
    }''',
    '''    } catch (e: any) {
      console.warn("MenstrualTracker fetch error:", e?.message);
    }'''
)

content = content.replace(
    '''    } catch(err) {
      console.error(err);
    }''',
    '''    } catch(err: any) {
      console.warn("MenstrualTracker delete error:", err?.message);
    }'''
)

with open('src/components/MenstrualTracker.tsx', 'w') as f:
    f.write(content)
