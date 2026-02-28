import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, StatusBar, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useFonts, Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

const NAVY        = '#1E2A4A';
const NAVY_DARK   = '#141E35';
const NAVY_LIGHT  = '#EEF0F8';
const GOLD        = '#F5A623';
const GOLD_LIGHT  = '#FFF8EC';
const BG          = '#F5F6FA';
const WHITE       = '#FFFFFF';
const TEXT_DARK   = '#1E2A4A';
const TEXT_MID    = '#666666';
const TEXT_LIGHT  = '#999999';
const RED         = '#FF3B30';
const RED_LIGHT   = '#FFF0F0';
const DONE_BG     = '#FFF8EC';

export default function App() {

  const [fontsLoaded] = useFonts({ Poppins_700Bold, Poppins_400Regular, Poppins_600SemiBold });

  const [inputText, setInputText] = useState('');
  const [tasks, setTasks]         = useState([]);
  const [filter, setFilter]       = useState('all');

  function addTaskHandler() {
    if (inputText.trim() === '') return;
    setTasks(current => [{ id: Math.random().toString(), text: inputText.trim(), done: false }, ...current]);
    setInputText('');
  }

  function deleteTaskHandler(id) {
    setTasks(current => current.filter(task => task.id !== id));
  }

  function toggleDoneHandler(id) {
    setTasks(current => current.map(task => task.id === id ? { ...task, done: !task.done } : task));
  }

  function clearDoneHandler() {
    setTasks(current => current.filter(task => !task.done));
    setFilter('all');
  }

  const doneCount   = tasks.filter(t => t.done).length;
  const activeCount = tasks.length - doneCount;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.done;
    if (filter === 'done')   return  task.done;
    return true;
  });

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={GOLD} /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY_DARK} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.goldLine} />
        <Text style={styles.title}>My Tasks</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBadge}>
            <Text style={[styles.statNumber, { color: GOLD }]}>{doneCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {[
          { key: 'all',    label: `All (${tasks.length})` },
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'done',   label: `Done (${doneCount})` },
        ].map(f => (
          <TouchableOpacity key={f.key} style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        {doneCount > 0 && (
          <TouchableOpacity style={styles.clearDoneBtn} onPress={clearDoneHandler}>
            <Text style={styles.clearDoneBtnText}>Clear Done</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No tasks here!</Text>
            <Text style={styles.emptySubText}>
              {filter === 'done' ? 'No completed tasks yet' : filter === 'active' ? 'No active tasks remaining' : 'Add your first task below'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.taskItem, item.done && styles.taskItemDone]}>
            <TouchableOpacity style={[styles.checkbox, item.done && styles.checkboxDone]} onPress={() => toggleDoneHandler(item.id)}>
              {item.done && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={[styles.taskText, item.done && styles.taskTextDone]}>{item.text}</Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTaskHandler(item.id)}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What needs to be done?"
          placeholderTextColor={TEXT_LIGHT}
          value={inputText}
          onChangeText={text => setInputText(text)}
          onSubmitEditing={addTaskHandler}
        />
        <TouchableOpacity style={[styles.addButton, inputText.trim() === '' && styles.addButtonDisabled]} onPress={addTaskHandler} disabled={inputText.trim() === ''}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: NAVY_LIGHT },
  container:        { flex: 1, backgroundColor: BG },

  header:  { backgroundColor: NAVY, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 24, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, elevation: 10 },
  goldLine:{ width: 40, height: 4, backgroundColor: GOLD, borderRadius: 2, marginBottom: 12 },
  title:   { fontFamily: 'Poppins_700Bold', fontSize: 30, color: WHITE, marginBottom: 16 },

  statsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10, gap: 20 },
  statBadge:   { alignItems: 'center' },
  statNumber:  { fontFamily: 'Poppins_700Bold', fontSize: 18, color: WHITE },
  statLabel:   { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },

  filterRow:           { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, gap: 8, flexWrap: 'wrap' },
  filterBtn:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: WHITE, borderWidth: 1.5, borderColor: NAVY },
  filterBtnActive:     { backgroundColor: NAVY },
  filterBtnText:       { fontFamily: 'Poppins_400Regular', fontSize: 12, color: NAVY },
  filterBtnTextActive: { color: WHITE, fontFamily: 'Poppins_600SemiBold' },
  clearDoneBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: RED_LIGHT, borderWidth: 1.5, borderColor: RED },
  clearDoneBtnText:    { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: RED },

  divider:     { height: 1.5, backgroundColor: NAVY, marginHorizontal: 20, marginTop: 16, opacity: 0.1 },
  listContent: { padding: 20, paddingTop: 14, flexGrow: 1 },

  taskItem:     { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 16, padding: 14, marginBottom: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: GOLD },
  taskItemDone: { backgroundColor: DONE_BG, borderLeftColor: NAVY },

  checkbox:     { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: GOLD, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxDone: { backgroundColor: GOLD },
  checkmark:    { color: WHITE, fontSize: 14, fontWeight: 'bold' },

  taskText:     { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: TEXT_DARK, lineHeight: 20 },
  taskTextDone: { textDecorationLine: 'line-through', color: TEXT_MID },

  deleteBtn:     { backgroundColor: RED_LIGHT, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  deleteBtnText: { color: RED, fontSize: 13, fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyEmoji:     { fontSize: 56, marginBottom: 4 },
  emptyText:      { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: NAVY, marginBottom: 4 },
  emptySubText:   { fontFamily: 'Poppins_400Regular', fontSize: 14, color: TEXT_MID, textAlign: 'center', paddingHorizontal: 30 },

  inputContainer:    { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: BG, gap: 12, alignItems: 'center' },
  input:             { flex: 1, backgroundColor: WHITE, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 13, fontSize: 14, fontFamily: 'Poppins_400Regular', color: TEXT_DARK, elevation: 2 },
  addButton:         { backgroundColor: GOLD, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  addButtonDisabled: { backgroundColor: TEXT_LIGHT, elevation: 0 },
  addButtonText:     { color: WHITE, fontSize: 28, fontWeight: '400', lineHeight: 32 },
});
