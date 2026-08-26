# Decoopa Backend - Cloud Functions

## Function Status Monitoring

### Functions with Issues (Fixed)
- ✅ `schedule-verifyDealStarted` - Fixed CPU quota issue
- ✅ `schedule-verifySaleOnVariantsEnded` - Fixed CPU quota issue  
- ✅ `schedule-verifySaleOnVariantsStarted` - Fixed CPU quota issue
- ✅ `triggers-user-created` - Fixed CPU quota issue

### Resource Configuration
- **CPU**: 0.5 per function (reduced from 1.0)
- **Memory**: 256Mi per function (reduced from 2GB)
- **Timeout**: 540 seconds
- **Max Instances**: 3 per function

### Schedule Times (Staggered)
- `schedule-verifySaleOnVariantsStarted`: 00:05 daily
- `schedule-verifySaleOnVariantsEnded`: 00:10 daily  
- `schedule-verifyDealStarted`: 00:15 daily
- `schedule-verifyDealEnded`: 00:20 daily

## Monitoring Commands

### Check Function Status
```bash
firebase functions:list
```

### View Function Logs
```bash
# All functions
firebase functions:log

# Specific functions
firebase functions:log --only schedule-verifyDealStarted,triggers-user-created
```

### Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific functions
firebase deploy --only functions:schedule-verifyDealStarted,triggers-user-created
```

## Troubleshooting

### CPU Quota Issues
If you see "Quota exceeded for total allowable CPU per project per region":
1. Reduce CPU allocation in function configuration
2. Stagger function execution times
3. Consider upgrading your GCP quota limits

### Memory Issues
If functions are running out of memory:
1. Increase memory allocation in function configuration
2. Optimize code to use less memory
3. Consider breaking large operations into smaller chunks

### Deployment Issues
If deployment fails:
1. Check GCP quota limits
2. Verify environment variables are set
3. Check function configuration syntax
4. Review logs for specific error messages

## Environment Variables Required
- `WALLET_BALANCE_KEY` - For wallet encryption
- `PRODUCTS_INDEX` - Algolia products index name
- Various Firebase configuration variables

## Best Practices
1. Always test functions locally before deployment
2. Monitor function logs regularly
3. Set up alerts for function failures
4. Use appropriate resource allocation
5. Implement proper error handling
6. Stagger scheduled function execution times 