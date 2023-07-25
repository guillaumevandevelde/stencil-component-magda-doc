import { Component, h, Host, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'communicationplatform-table',
  styleUrl: 'communicationplatform-table.css',
  shadow: true,
})
export class CommunicationplatformTable {
  @Prop() apiurl!: string;
  @Prop() columns: string;
  @Prop() filters : string;  
  @Prop() totalparameter : string;
  
  @Prop() limitqueryparameter: string ; 
  @Prop() offsetqueryparameter: string ;

  @State() data: any[] = [];
  @State() limit: number = 10;  
  @State() offset: number = 0;

  @State() currentPage = 1;
  @State() isTyping = false;

  @State() totalItems : number;
  @State() filtersApplied: Map<string, string> = new Map();


  private timeout: any;
  private parsedFilters : string[] = [];
  
  constructor() {
    this.parsedFilters = JSON.parse(this.filters);
  }


  async componentDidLoad() {
        
    await this.fetchData();
  }

  @Watch('offset')
  handlePageSizeChange() {    
    this.fetchData();
  }


  async fetchData() {
    const url = new URL(this.apiurl);
    const params = new URLSearchParams(url.search);

    for (const [column, filterValue] of this.filtersApplied) {
      params.set(column, filterValue || '');
    }

    if(this.limitqueryparameter != null){
    params.set(this.limitqueryparameter, this.limit.toString());
    }
    if (this.offsetqueryparameter != null) {
      params.set(this.offsetqueryparameter, this.offset.toString());
    }

    url.search = params.toString();
    const response = await fetch(url.toString());
    const jsonData = await response.json();    
    this.totalItems = jsonData[this.totalparameter] ?? 1;  
    // Update the data based on the received JSON
    if (Array.isArray(jsonData)) {
      this.data = jsonData.map((item: any) => this.formatTime(item));
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      const firstArrayProp = Object.values(jsonData).find(Array.isArray);
      if (firstArrayProp) {
        this.data = firstArrayProp.map((item: any) => this.formatTime(item));
      } else {
        console.error('Invalid JSON data:', jsonData);
      }
    } else {
      console.error('Invalid JSON data:', jsonData);
    } 
  }

  extractValue(obj: any, path: string) {
    const keys = path.split('.');
    let value: any = obj;

    for (const key of keys) {
      if (typeof value === 'object' && value !== null && key in value) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }

    // Convert numeric values to strings
    if (typeof value === 'number') {
      value = value.toString();
    }

    // Convert date values to ISO date strings
    if (value instanceof Date) {
      value = value.toISOString().split('T')[0];
    }

    return value || '';
  }

  formatTime(item: any) {
    const convertedItem = { ...item };

    for (const key in convertedItem) {
      if (key.toLowerCase().includes('time')) {
        const utcTime = convertedItem[key];
        const localTime = new Date(utcTime);
        convertedItem[key] = localTime.toLocaleString();
      }
    }

    return convertedItem;
  }

  private isTimeColumn(column: string): boolean {
    return column.toLowerCase().includes('time');
  }

  handleItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.limit = parseInt(target.value);
    this.currentPage = 1;
    this.offset = 0; // Reset current page when items per page change       
    this.fetchData();
  }

   handleFilterChange(column: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const filterValue = target.value.trim();

    if (this.isTimeColumn(column)) {
      // For "time" columns, use the "min" and "max" attributes of the input
      const filterType = target.getAttribute('data-filter-type');
      const filterKey = `${column}${filterType}`;

      if (filterValue === '') {
        this.filtersApplied.delete(filterKey);
      } else {
        this.filtersApplied.set(filterKey, filterValue);
      }
    } else {
      // For other columns, use the regular filter behavior
      if (filterValue === '') {
        this.filtersApplied.delete(column);
      } else {
        this.filtersApplied.set(column, filterValue);
      }
    }

    clearTimeout(this.timeout);
    this.isTyping = true;

    this.timeout = setTimeout(() => {
      this.isTyping = false;
      this.fetchData();
    }, 500);
  }

  renderPagination() {
    const totalPages = Math.ceil(this.totalItems / this.limit);

    return (
      <div class="pagination">
        <button disabled={this.currentPage === 1} onClick={() => (
          this.currentPage = this.currentPage - 1,
          this.offset = this.offset - this.limit,
          this.fetchData()          
          )}>
          Previous
        </button>
        <span class="page-of">{`Page ${this.currentPage} of ${totalPages}`}</span>
        <button disabled={this.currentPage === totalPages} onClick={() => (
          this.currentPage = this.currentPage + 1,
          this.offset = this.offset + this.limit,
          this.fetchData()
          )}>
          Next
        </button>
      </div>
    );
  }

  render() {
    const parsedColumns = JSON.parse(this.columns);      

    return (
      <Host>
        <div class="table-container">
          <table class="custom-table">
            <thead>   
              <tr>
                {parsedColumns.map((column: string) => <th>{column}</th>)}
              </tr>           
              <tr>
                {parsedColumns.map((column: string) =>  {    
                  if (this.isTimeColumn(column)) {
                    return (
                      <th>
                        <input
                          class= "date-input"
                          type="date"                          
                          id={`filter-${column}-start`}
                          placeholder={`Start Date`}
                          data-filter-type="Start"
                          value={this.filtersApplied.get(`${column}Start`) || ''}
                          onInput={(event) => this.handleFilterChange(column, event)}
                        />
                        <input
                          class= "date-input"
                          type="date"
                          id={`filter-${column}-end`}
                          placeholder={`End Date`}
                          data-filter-type="End"
                          value={this.filtersApplied.get(`${column}End`) || ''}
                          onInput={(event) => this.handleFilterChange(column, event)}
                        />
                      </th>
                    );
                  } else if (this.parsedFilters.includes(column)) {
                    return (
                      <th>
                        <input
                          type="text"
                          id={`filter-${column}`}
                          placeholder={`Filter ${column}`}
                          value={this.filtersApplied.get(column) || ''}
                          onInput={(event) => this.handleFilterChange(column, event)}
                        />
                      </th>
                    );
                  } else {
                    return <th></th>;
                  }
                })}
              </tr>
            </thead>
            <tbody>
              {this.data.map((item: any) => (
                <tr>
                  {parsedColumns.map((column: string) => (
                    <td>{this.extractValue(item, column)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div class="items-per-page">
          <label htmlFor="itemsPerPage">Items per page:</label>
          <select id="itemsPerPage" onChange={event => this.handleItemsPerPageChange(event)}>
            <option value="10">10</option>            
            <option value="50">50</option>
            <option value="100">100</option>
          </select>       
        </div>
        {this.renderPagination()}
      </Host>
    );
  }
}
