export default `
query ScheduledEmployees(
    $locationID: ID!
    $date: Date!
    $query: String!
    $page: Int!
    $size: Int
    $scheduled: Boolean
  ) {
    scheduledEmployees(
      locationId: $locationID
      date: $date
      query: $query
      page: $page
      size: $size
      scheduled: $scheduled
    ) {
      __typename
      pagination {
        __typename
        currentPage
        nextPage
        size
        total
      }
      scheduledEmployees {
        __typename
        ...ScheduledEmployeeFragment
      }
      hiddenScheduledEmployeesCount
    }
  }
  fragment ScheduledEmployeeFragment on ScheduledEmployee {
    __typename
    id
    email
    name
    date
    desk {
      __typename
      ...DeskFragment
    }
    employeeId
    scheduled
  }
  fragment DeskFragment on Desk {
    __typename
    id
    deskAvailability
    name
    neighborhood
    floor {
      __typename
      id
      name
      building
      floorPlanUrl
      floorNumber
    }
    x
    y
    status
  }
`.trim()