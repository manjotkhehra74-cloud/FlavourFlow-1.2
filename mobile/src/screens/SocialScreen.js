import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Screen, Card, Avatar, Row, EmptyState, NavHeader } from '../components/UI';
import { colors, avatarColorFor, fmtTime } from '../theme';

export default function SocialScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState({ today: [], birthdays: [], anniversaries: [] });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, e] = await Promise.all([Api.posts(), Api.events()]);
      setPosts(p.posts);
      setEvents(e);
    } catch (e) { Alert.alert('Error', e.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const toggleLike = async (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (p.liked_by.includes(user.id) ? -1 : 1), liked_by: p.liked_by.includes(user.id) ? p.liked_by.filter(x => x !== user.id) : [...p.liked_by, user.id] } : p));
    try { await Api.likePost(id); } catch { await load(); }
  };

  const sendWish = async (recipient, type) => {
    await Api.sendWish(recipient.id, type,
      type === 'birthday' ? `Happy birthday ${recipient.name.split(' ')[0]}! 🎂` : `Happy work anniversary ${recipient.name.split(' ')[0]}! 🎉`
    );
    Alert.alert('Wish sent!', `Your wish was posted to ${recipient.name}.`);
  };

  return (
    <Screen>
      <NavHeader
        title="Social Wall"
        navigation={navigation}
        right={
          <TouchableOpacity onPress={() => navigation.navigate('NewPost', { onCreated: load })} style={styles.newBtn}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 6, fontSize: 12 }}>Post</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={posts}
        keyExtractor={(p) => String(p.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View>
            {events.today?.length ? (
              <Card style={{ backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#DDD6FE' }}>
                <Text style={styles.eventTitle}>Today's celebrations</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  {events.today.map(p => (
                    <View key={p.id} style={styles.eventCard}>
                      <Avatar name={p.name} color={p.avatar_color || avatarColorFor(p.name)} size={56} />
                      <Text style={styles.eventName}>{p.name.split(' ')[0]}</Text>
                      <Text style={styles.eventSub}>{p.event === 'birthday' ? 'Birthday' : `${p.years}yr anniv.`}</Text>
                      <TouchableOpacity style={styles.wishBtn} onPress={() => sendWish(p, p.event)}>
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>🎉 Send wish</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </Card>
            ) : null}

            {(events.birthdays?.length || events.anniversaries?.length) ? (
              <Card>
                <Text style={styles.section}>This month</Text>
                {events.birthdays?.length ? (
                  <Text style={styles.sub}>🎈 Birthdays: {events.birthdays.map(p => p.name).join(', ')}</Text>
                ) : null}
                {events.anniversaries?.length ? (
                  <Text style={styles.sub}>🏆 Anniversaries: {events.anniversaries.map(p => `${p.name.split(' ')[0]} (${p.years}y)`).join(', ')}</Text>
                ) : null}
              </Card>
            ) : null}
            <Text style={styles.feedTitle}>Feed</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="No posts yet" subtitle="Be the first to share an update!" />}
        renderItem={({ item }) => (
          <Card>
            <Row style={{ alignItems: 'flex-start' }}>
              <Avatar name={item.author_name} color={item.author_color || avatarColorFor(item.author_name)} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '800' }}>{item.author_name}</Text>
                  <Text style={{ color: colors.subtext, fontSize: 11 }}>{fmtTime(item.created_at)}</Text>
                </Row>
                {item.badge ? <Text style={styles.badge}>🏅 {item.badge}</Text> : null}
                <Text style={{ marginTop: 6, lineHeight: 20 }}>{item.body}</Text>
                {item.reward_name ? (
                  <Text style={styles.reward}>🎁 Rewarded to {item.reward_name}</Text>
                ) : null}
                <Row style={{ marginTop: 12, gap: 20 }}>
                  <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.action}>
                    <Ionicons name={item.liked_by.includes(user.id) ? 'heart' : 'heart-outline'}
                      size={18} color={item.liked_by.includes(user.id) ? colors.red : colors.subtext} />
                    <Text style={{ marginLeft: 6, color: colors.subtext, fontWeight: '600' }}>{item.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action}>
                    <Ionicons name="chatbubble-outline" size={18} color={colors.subtext} />
                    <Text style={{ marginLeft: 6, color: colors.subtext, fontWeight: '600' }}>{item.comments.length}</Text>
                  </TouchableOpacity>
                </Row>
                {item.comments.length ? (
                  <View style={styles.comments}>
                    {item.comments.map(c => (
                      <View key={c.id} style={{ marginBottom: 6 }}>
                        <Text><Text style={{ fontWeight: '800' }}>{c.author_name}: </Text>{c.body}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </Row>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  newBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  eventTitle: { fontWeight: '800', color: colors.primary },
  eventCard: { width: 110, backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', marginRight: 10, marginTop: 4 },
  eventName: { fontWeight: '800', marginTop: 6 },
  eventSub: { color: colors.subtext, fontSize: 11 },
  wishBtn: { marginTop: 8, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  section: { fontWeight: '800', marginBottom: 6 },
  sub: { color: colors.subtext, marginTop: 4 },
  feedTitle: { fontSize: 15, fontWeight: '800', marginHorizontal: 20, marginTop: 10, marginBottom: 4 },
  badge: { color: colors.orange, fontWeight: '700', fontSize: 12, marginTop: 2 },
  reward: { color: colors.purple, fontWeight: '700', marginTop: 6, fontSize: 12 },
  action: { flexDirection: 'row', alignItems: 'center' },
  comments: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
});
