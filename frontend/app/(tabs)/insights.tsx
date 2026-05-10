import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BarChart3, Sparkles, TrendingUp, Target } from 'lucide-react-native';
import apiClient from '../../api/client';

const COLORS = {
  bg: '#F7F7F7',
  card: '#FFFFFF',
  primary: '#D7614C',
  text: '#1F2937',
  muted: '#8A8A8A',
  border: '#EEEEEE',
  success: '#22C55E',
  warning: '#EAB308',
  softRed: '#FDECEA',
  softGreen: '#EAFBF3',
};

export default function RecommendationInsightsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchPerformance();
    }, [])
  );

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/recommendations/csv-performance');
      setData(response.data);
    } catch (error) {
      console.error('CSV performance error:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxPair =
    data?.topPairs?.length > 0
      ? Math.max(...data.topPairs.map((item: any) => item.pairCount))
      : 1;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Failed to load analytics.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Recommendation Performance</Text>
          <Text style={styles.subtitle}>CSV-based smart order analytics</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Sparkles color={COLORS.primary} size={24} />
            <Text style={styles.statLabel}>Total Rules</Text>
            <Text style={styles.statValue}>{data.totalRules}</Text>
          </View>

          <View style={styles.statCard}>
            <Target color={COLORS.success} size={24} />
            <Text style={styles.statLabel}>Avg Confidence</Text>
            <Text style={styles.statValue}>{data.avgConfidence}%</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <TrendingUp color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>Top Confidence Rules</Text>
          </View>

          {data.topConfidence.map((item: any, index: number) => (
            <View key={index} style={styles.ruleBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>
                  {item.selectedProduct} → {item.recommendedProduct}
                </Text>
                <Text style={styles.ruleSub}>
                  Pair Count: {item.pairCount}
                </Text>
              </View>

              <View style={styles.percentCircle}>
                <Text style={styles.percentText}>{item.confidence}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <BarChart3 color={COLORS.primary} size={20} />
            <Text style={styles.sectionTitle}>Pair Count Bar Chart</Text>
          </View>

          {data.topPairs.map((item: any, index: number) => {
            const widthPercent = Math.max((item.pairCount / maxPair) * 100, 8);

            return (
              <View key={index} style={styles.chartRow}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartLabel}>
                    {item.selectedProduct} → {item.recommendedProduct}
                  </Text>
                  <Text style={styles.chartValue}>{item.pairCount}</Text>
                </View>

                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pie-style Confidence View</Text>

          {data.topConfidence.slice(0, 3).map((item: any, index: number) => (
            <View key={index} style={styles.pieRow}>
              <View style={styles.pieDot} />
              <Text style={styles.pieText}>
                {item.recommendedProduct} - {item.confidence}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 34,
    paddingBottom: 110,
  },
  loader: {
    marginTop: 80,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 10,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  ruleBox: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  ruleSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  percentCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.softRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  chartRow: {
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  chartLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
    flex: 1,
  },
  chartValue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
    marginLeft: 8,
  },
  barBg: {
    height: 10,
    backgroundColor: COLORS.softRed,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pieDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  pieText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.muted,
  },
});