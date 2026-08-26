# Cloud Functions Monitoring Setup

## Google Cloud Monitoring Alerts

### 1. Function Error Rate Alert
- **Metric**: `cloudfunctions.googleapis.com/function/execution_count`
- **Filter**: `resource.labels.function_name="schedule-verifyDealStarted"`
- **Condition**: Error rate > 5% over 5 minutes
- **Action**: Send email/Slack notification

### 2. Function Duration Alert
- **Metric**: `cloudfunctions.googleapis.com/function/execution_times`
- **Filter**: `resource.labels.function_name="triggers-user-created"`
- **Condition**: Duration > 300 seconds
- **Action**: Send email/Slack notification

### 3. Memory Usage Alert
- **Metric**: `cloudfunctions.googleapis.com/function/memory_utilization`
- **Filter**: All functions
- **Condition**: Memory utilization > 80%
- **Action**: Send email/Slack notification

### 4. CPU Quota Alert
- **Metric**: `cloudfunctions.googleapis.com/function/instance_count`
- **Filter**: All functions
- **Condition**: Instance count approaching quota limit
- **Action**: Send email/Slack notification

## Setup Commands

### Create Alert Policy
```bash
gcloud alpha monitoring policies create \
  --policy-from-file=alert-policy.yaml \
  --project=decoopa-50ce2
```

### Example Alert Policy (alert-policy.yaml)
```yaml
displayName: "Cloud Functions Error Rate"
conditions:
- displayName: "Error rate > 5%"
  conditionThreshold:
    filter: 'resource.type="cloud_function" AND resource.labels.function_name="schedule-verifyDealStarted"'
    comparison: COMPARISON_GREATER_THAN
    thresholdValue: 0.05
    duration: 300s
    aggregations:
    - alignmentPeriod: 60s
      perSeriesAligner: ALIGN_RATE
      crossSeriesReducer: REDUCE_MEAN
notificationChannels:
- projects/decoopa-50ce2/notificationChannels/YOUR_CHANNEL_ID
```

## Dashboard Setup

### Create Custom Dashboard
1. Go to Google Cloud Console > Monitoring > Dashboards
2. Create new dashboard
3. Add widgets for:
   - Function execution count
   - Function error rate
   - Function duration
   - Memory utilization
   - CPU utilization

### Key Metrics to Monitor
- **Execution Count**: Number of function invocations
- **Error Rate**: Percentage of failed executions
- **Duration**: Average execution time
- **Memory Usage**: Memory utilization per function
- **Instance Count**: Number of running instances

## Best Practices
1. Set up alerts for all critical functions
2. Monitor during peak usage times
3. Set up different alert thresholds for different environments
4. Include relevant context in alert messages
5. Test alert notifications regularly
6. Document alert procedures and escalation paths 