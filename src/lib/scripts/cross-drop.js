// Add this data array
const tableData = [
    { date: "09.12.2025", time: "12:16", address: "2151 SW 36TH ST", city: "San Antonio", state: "TX", zip: "78237", tankGrade: "Diesel #2", tankNo: "1", preventedDelivery: "GASOLINE" },
    { date: "09.01.2025", time: "9:04", address: "207 E HWY 90A", city: "Richmond", state: "TX", zip: "77406", tankGrade: "Diesel #2", tankNo: "1", preventedDelivery: "GASOLINE" },
    { date: "08.14.2025", time: "5:52", address: "619 CROSSROADS ST", city: "Laredo", state: "TX", zip: "78045", tankGrade: "GAS 87 OCTANE 10.0% ETHANOL 9.0 RVP", tankNo: "6", preventedDelivery: "DIESEL" },
    { date: "07.09.2025", time: "2:40", address: "2901 highway 35 N", city: "Rockport", state: "TX", zip: "78382", tankGrade: "GAS 87 OCTANE 10.0% ETHANOL 9.0 RVP", tankNo: "4", preventedDelivery: "DIESEL" },
    { date: "06.30.2025", time: "23:28", address: "6321 S 23rd St.", city: "McAllen", state: "TX", zip: "78503", tankGrade: "Diesel #2", tankNo: "2", preventedDelivery: "GASOLINE" },
    { date: "06.24.2025", time: "20:16", address: "6321 S 23rd St.", city: "McAllen", state: "TX", zip: "78503", tankGrade: "Diesel #2", tankNo: "4", preventedDelivery: "GASOLINE" },
    { date: "06.03.2025", time: "17:04", address: "11102 IH-37 Access", city: "Corpus Christi", state: "TX", zip: "78401", tankGrade: "GAS 87 OCTANE 10.0% ETHANOL 9.0 RVP", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "05.19.2025", time: "13:52", address: "2202 HOLLY ROAD", city: "Corpus Christi", state: "TX", zip: "78415", tankGrade: "Gas 93 OCTANE 10% ETH 9.0RVP", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "05.14.2025", time: "10:40", address: "9111 N. Interstate 35", city: "Jarrell", state: "TX", zip: "76537", tankGrade: "Gas 93 OCTANE 10% ETH 9.0RVP", tankNo: "7", preventedDelivery: "DIESEL" },
    { date: "04.23.2025", time: "7:28", address: "16555 HUEBNER RD", city: "San Antonio", state: "TX", zip: "78248", tankGrade: "Gas 93 OCTANE 10% ETH 9.0RVP", tankNo: "3", preventedDelivery: "DIESEL" },
    { date: "04.22.2025", time: "4:16", address: "1301 N LOOP 340", city: "LACY LAKEVIEW", state: "TX", zip: "76705", tankGrade: "GAS 87 NO ETH 9.0 RVP ", tankNo: "6", preventedDelivery: "DIESEL" },
    { date: "04.04.2025", time: "1:04", address: "720 SPRING VALLEY", city: "Hewitt", state: "TX", zip: "76643", tankGrade: "Diesel #2", tankNo: "5", preventedDelivery: "GASOLINE" },
    { date: "02.22.2025", time: "21:52", address: "3225 E EXPY 83", city: "Weslaco", state: "TX", zip: "78596", tankGrade: "Diesel #2", tankNo: "4", preventedDelivery: "GASOLINE" },
    { date: "02.11.2025", time: "18:40", address: "101 N WATER ST", city: "Burnet", state: "TX", zip: "78611", tankGrade: "GAS 91 NO ETH 9.0 RVP", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "01.29.2025", time: "15:28", address: "S. 9th & Tyler Ave.", city: "Harlingen", state: "TX", zip: "78550", tankGrade: "Diesel #2", tankNo: "2", preventedDelivery: "GASOLINE" },
    { date: "01.18.2025", time: "12:16", address: "S. 9th & Tyler Ave.", city: "Harlingen", state: "TX", zip: "78550", tankGrade: "High Ethanol ", tankNo: "4", preventedDelivery: "DIESEL" },
    { date: "01.12.2025", time: "9:04", address: "15513 STATE HWY 30", city: "Roans Prairie", state: "TX", zip: "77875", tankGrade: "GAS 87 OCTANE 10.0% ETHANOL 9.0 RVP", tankNo: "4", preventedDelivery: "DIESEL" },
    { date: "01.03.2025", time: "5:52", address: "5202 IH 37", city: "Corpus Christi", state: "TX", zip: "78407", tankGrade: "Gas 93 OCTANE 10% ETH 9.0RVP", tankNo: "4", preventedDelivery: "DIESEL" },
    { date: "12.22.2024", time: "2:40", address: "12200 FM 969 RD", city: "Austin", state: "TX", zip: "78724", tankGrade: "Diesel #2", tankNo: "5", preventedDelivery: "GASOLINE" },
    { date: "12.21.2024", time: "23:28", address: "905 N. McCoy Blvd.", city: "New Boston", state: "TX", zip: "75570", tankGrade: "GAS 87 NO ETH 9.0 RVP ", tankNo: "4", preventedDelivery: "DIESEL" },
    { date: "12.13.2024", time: "20:16", address: "101 EE OHNMEISS BLVD", city: "Lampasas", state: "TX", zip: "76550", tankGrade: "GAS 87 NO ETH 9.0 RVP ", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "12.02.2024", time: "17:04", address: "16222 WALLISVILLE RD", city: "Houston", state: "TX", zip: "77001", tankGrade: "Diesel #2", tankNo: "5", preventedDelivery: "GASOLINE" },
    { date: "11.09.2024", time: "13:52", address: "27137 TOMBALL PKWY", city: "Tomball", state: "TX", zip: "77375", tankGrade: "Diesel #2", tankNo: "5", preventedDelivery: "GASOLINE" },
    { date: "10.30.2024", time: "10:40", address: "6406 Old Pearsall Rd", city: "San Antonio", state: "TX", zip: "78252", tankGrade: "GAS 87 OCTANE 10.0% ETHANOL 9.0 RVP", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "09.09.2024", time: "7:28", address: "21997 FM 1314", city: "Porter", state: "TX", zip: "77365", tankGrade: "High Ethanol ", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "08.10.2024", time: "4:16", address: "9157 FM 471 N", city: "San Antonio", state: "TX", zip: "78253", tankGrade: "GAS 87 OCTANE 10.0% ETHANOL 9.0 RVP", tankNo: "5", preventedDelivery: "DIESEL" },
    { date: "06.28.2024", time: "1:04", address: "10537 N. Hwy. 359", city: "Mathis", state: "TX", zip: "78368", tankGrade: "Diesel #2", tankNo: "4", preventedDelivery: "GASOLINE" },
    { date: "05.01.2024", time: "21:52", address: "1303 W MOUNT HOUSTON RD", city: "Houston", state: "TX", zip: "77001", tankGrade: "GAS 87 NO ETH 9.0 RVP ", tankNo: "4", preventedDelivery: "DIESEL" },
    { date: "04.28.2024", time: "18:40", address: "31700 INTERSTATE 10 W", city: "Boerne", state: "TX", zip: "78006", tankGrade: "GAS 87 NO ETH 9.0 RVP ", tankNo: "4", preventedDelivery: "DIESEL" }
];

export function disableBrowserAutocomplete() {
    // Get all input fields in the search fields section
    const inputs = document.querySelectorAll('.search-fields input');
    
    inputs.forEach(input => {
        // Set attributes to prevent browser autocomplete
        
        // Add a random name to prevent browser autocomplete
        const randomName = input.id + '_' + Math.random().toString(36).substring(2, 9);
        input.setAttribute('name', randomName); 
        if (input.id === 'State' || input.id === 'Zip' || input.id === 'Date' || input.id === 'ST-address' || input.id ==='City' || input.id ==='Fuel') {
            input.setAttribute('autocomplete', 'new-password');
            input.setAttribute('data-lpignore', 'true');
            input.setAttribute('data-form-type', 'other');
        }
    });
}
export async function fetchPreventions() {
    return tableData;
}