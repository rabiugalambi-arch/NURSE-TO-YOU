import re

with open('src/components/MenstrualTracker.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''  const handleDelete = async (id: string) => {
    if (confirm("Delete this cycle record?")) {
      try {
        await deleteDoc(doc(db, 'menstrualCycles', id));
        fetchCycles();
      } catch(err) {
        console.error(err);
      }
    }
  };''',
    '''  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menstrualCycles', id));
      fetchCycles();
    } catch(err) {
      console.error(err);
    }
  };'''
)

with open('src/components/MenstrualTracker.tsx', 'w') as f:
    f.write(content)
