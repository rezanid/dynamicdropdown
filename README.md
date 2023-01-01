# What is DynamicDropDown for Power Platform
DynamicDropdown for Power Platform is a drop down field component that its list can change dynamically based on values of other fields. It is very simple to use. You just need a query (fetchXml or OData) to fill the list and your query can contain tokens that will be replaced with the values of other fields automatically.

# How to use

1. You can either download the latest released component from repository's release page or get the latest version from the official [PCF Gallery](https://pcf.gallery)
2. Import the solution to your desired environment.
3. Use Dynamic Dropdown for a field in any form. The field needs to be either a Single Line Text or a Lookup.

# Limitations
* Only fields of type ***Single line of text*** and ***Lookup*** are supported
* Currently the query that is used to fill the list part of the component can depend only on five other fields in the form.

* Reference
