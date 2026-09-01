# List Sort API Contract

**Transport:** GraphQL over HTTP  
**Endpoint:** `POST /graphql`  
**Auth:** Firebase ID token — `Authorization: Bearer <token>`

Machine-readable: [`list-sort-api-contract.json`](./list-sort-api-contract.json)  
Regenerate: `node scripts/generate-list-sort-contract.js`

---

## Summary

List queries use **`sort: [SortInput!]`**:

```graphql
input SortInput {
  field: String!
  order: SortByEnum   # asc | desc (default: asc)
}
```

| When omitted | Default |
|--------------|---------|
| Most list endpoints | `[{ field: "createdAt", order: asc }]` |
| `sliderList` | `[{ field: "createdAt", order: desc }]` |

Pagination stays in `PaginationInput` — **without** `sortBy`.

---

## Paginated endpoints

| `adList` | `ads` |
| `brandList` | `brand` |
| `categoryList` | `category` |
| `collectionList` | `collection` |
| `contactUsList` | `contactUs` |
| `customRequestList` | `customRequest` |
| `myCustomRequests` | `customRequest` |
| `dealList` | `deal` |
| `adminList` | `user` |
| `customerList` | `user` |
| `inventoryList` | `product-variants` |
| `inventoryListArchivedItems` | `product-variants` |
| `listMyNotifications` | `notification` |
| `orderList` | `order` |
| `listCustomerOrders` | `order` |
| `myBillingHistory` | `order` |
| `projectList` | `project` |
| `reviewList` | `reviews` |
| `listCustomerReviews` | `reviews` |
| `showRoomList` | `showRoom` |
| `transactionList` | `transaction` |
| `listMyTransactions` | `transaction` |
| `listDecoopaAccountTransactions` | `transaction` |
| `voucherList` | `voucher` |
| `walletList` | `wallet` |
| `withdrawalRequestsList` | `withdrawalRequest` |
| `viewReturnRequests` | `returnRequest` |

## Non-paginated (sort only)

| `addressList` | `addresses` |
| `listMyAddresses` | `addresses` |
| `listCustomerAddresses` | `addresses` |
| `optionList` | `variants_options` |
| `findProductReviews` | `reviews` |

## Slider

| `sliderList` | `slider` |

---

## Excluded

- `auditLogList` — Uses AuditLogListOrderByEnum (field_ASC / field_DESC)
- `iamListRoles` — Uses RoleWithUsersOrderByEnum (field_ASC / field_DESC)
- `iamListUsers` — Uses UserWithRolesOrderByEnum (field_ASC / field_DESC)
- `brandListAll` — Non-paginated dump list — no sort arg
- `dealListAll` — Non-paginated dump list — no sort arg
- `adListAll` — Non-paginated dump list — no sort arg
- `contactUsListAll` — Non-paginated dump list — no sort arg
