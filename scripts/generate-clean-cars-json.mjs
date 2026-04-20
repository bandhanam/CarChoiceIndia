#!/usr/bin/env node
import { writeFileSync } from "fs";

const brands = [
  { name: "Maruti Suzuki", emoji: "🟡", color: "#E31837", country: "Japan" },
  { name: "Hyundai", emoji: "🔷", color: "#002C5F", country: "South Korea" },
  { name: "Tata", emoji: "🔵", color: "#0066FF", country: "India" },
  { name: "Mahindra", emoji: "🔴", color: "#D4213D", country: "India" },
  { name: "Kia", emoji: "🟠", color: "#05141F", country: "South Korea" },
  { name: "Honda", emoji: "🟥", color: "#CC0000", country: "Japan" },
  { name: "Toyota", emoji: "🔶", color: "#EB0A1E", country: "Japan" },
  { name: "Skoda", emoji: "🟩", color: "#4BA82E", country: "Czech Republic" },
  { name: "Volkswagen", emoji: "🔵", color: "#001E50", country: "Germany" },
  { name: "MG Motor", emoji: "⬛", color: "#1B1B1B", country: "China/UK" },
  { name: "Renault", emoji: "🔶", color: "#FFCC00", country: "France" },
  { name: "Citroen", emoji: "🔴", color: "#AC1A2F", country: "France" },
  { name: "Nissan", emoji: "⬜", color: "#C3002F", country: "Japan" },
];

// Raw sheet data: [company, model, variant, price, engineType, engineCC, fuelType, transmission, drivetrain, hp, torque, mileage, topSpeed, accel, sunroof, turbo, adas, alloy, abs, esp, cam360, ventSeats, wirelessCharger, connectedCar, ledHeadlamps, cruiseControl, tpms, hillAssist, isofix, pushButton, airbags, bodyType, seating]
const rows = [
  ["Maruti Suzuki","Swift","LXi",699000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",82,"112 Nm",25.75,170,13.5,false,false,false,false,true,true,false,false,false,false,true,false,false,false,true,false,2,"Hatchback",5],
  ["Maruti Suzuki","Swift","VXi",799000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",82,"112 Nm",25.75,170,13.0,false,false,false,true,true,true,false,false,false,false,true,false,false,false,true,true,2,"Hatchback",5],
  ["Maruti Suzuki","Swift","ZXi",899000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",82,"112 Nm",25.75,170,13.0,false,false,false,true,true,true,false,false,false,true,true,true,true,false,true,true,4,"Hatchback",5],
  ["Maruti Suzuki","Swift","ZXi+ AT",999000,"Petrol NA","1197 CC","Petrol","AMT","FWD",82,"112 Nm",25.75,170,13.5,false,false,false,true,true,true,false,false,true,true,true,true,true,false,true,true,6,"Hatchback",5],
  ["Maruti Suzuki","Baleno","Sigma",674000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",90,"113 Nm",22.94,175,12.5,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"Hatchback",5],
  ["Maruti Suzuki","Baleno","Delta",774000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",90,"113 Nm",22.94,175,12.5,false,false,false,true,true,true,false,false,false,true,true,false,false,false,true,true,2,"Hatchback",5],
  ["Maruti Suzuki","Baleno","Zeta",849000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",90,"113 Nm",22.94,175,12.5,false,false,false,true,true,true,false,false,false,true,true,true,true,false,true,true,4,"Hatchback",5],
  ["Maruti Suzuki","Baleno","Alpha AMT",999000,"Petrol NA","1197 CC","Petrol","AMT","FWD",90,"113 Nm",22.94,175,12.5,false,false,false,true,true,true,true,false,false,true,true,true,true,false,true,true,6,"Hatchback",5],
  ["Maruti Suzuki","Dzire","LXi",674000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",82,"112 Nm",25.71,170,13.5,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"Sedan",5],
  ["Maruti Suzuki","Dzire","VXi AGS",874000,"Petrol NA","1197 CC","Petrol","AMT","FWD",82,"112 Nm",25.71,170,13.5,false,false,false,false,true,true,false,false,false,true,true,false,false,false,true,true,2,"Sedan",5],
  ["Maruti Suzuki","Dzire","ZXi+ AGS",989000,"Petrol NA","1197 CC","Petrol","AMT","FWD",82,"112 Nm",25.71,170,13.5,false,false,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"Sedan",5],
  ["Maruti Suzuki","Brezza","LXi",839000,"Petrol NA","1462 CC","Petrol","5-Speed MT","FWD",103,"137 Nm",19.80,180,12.0,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"SUV Compact",5],
  ["Maruti Suzuki","Brezza","VXi",979000,"Petrol NA","1462 CC","Petrol","5-Speed MT","FWD",103,"137 Nm",19.80,180,12.0,false,false,false,true,true,true,false,false,false,true,true,false,true,false,true,true,2,"SUV Compact",5],
  ["Maruti Suzuki","Brezza","ZXi+ AT",1404000,"Petrol NA","1462 CC","Petrol","6-Speed AT","FWD",103,"137 Nm",19.80,180,12.0,true,false,false,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Maruti Suzuki","Grand Vitara","Sigma MT",1099000,"Petrol NA","1462 CC","Petrol","5-Speed MT","FWD",103,"137 Nm",21.11,180,11.5,false,false,false,true,true,true,false,false,false,false,true,false,true,false,true,true,6,"SUV",5],
  ["Maruti Suzuki","Grand Vitara","Alpha+ AT Hybrid",1949000,"Strong Hybrid","1490 CC","Petrol Hybrid","eCVT","FWD",116,"122 Nm",27.97,170,11.0,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Maruti Suzuki","Grand Vitara","Alpha+ AWD",1799000,"Petrol Turbo","1462 CC","Petrol","6-Speed AT","AWD",103,"137 Nm",19.38,180,11.5,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Maruti Suzuki","Ertiga","LXi MT",862000,"Petrol NA","1462 CC","Petrol","5-Speed MT","FWD",103,"137 Nm",20.51,175,13.0,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"MPV",7],
  ["Maruti Suzuki","Ertiga","ZXi+ AT",1299000,"Petrol NA","1462 CC","Petrol","6-Speed AT","FWD",103,"137 Nm",20.30,175,13.0,false,false,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"MPV",7],
  ["Maruti Suzuki","XL6","Alpha+ AT",1449000,"Petrol NA","1462 CC","Petrol","6-Speed AT","FWD",103,"137 Nm",20.30,175,13.0,false,false,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"MPV",6],
  ["Maruti Suzuki","Fronx","Sigma MT",774000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",90,"113 Nm",22.89,180,12.0,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"SUV Coupe",5],
  ["Maruti Suzuki","Fronx","Alpha+ 1.0T AT",1324000,"Petrol Turbo","998 CC","Petrol","6-Speed AT","FWD",100,"148 Nm",20.01,185,10.0,true,true,false,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV Coupe",5],
  ["Maruti Suzuki","Jimny","Alpha MT",1274000,"Petrol NA","1462 CC","Petrol","5-Speed MT","4WD",105,"134 Nm",16.94,145,14.0,false,false,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"SUV Off-Road",4],
  ["Maruti Suzuki","Jimny","Alpha AT",1374000,"Petrol NA","1462 CC","Petrol","4-Speed AT","4WD",105,"134 Nm",14.48,145,14.5,false,false,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"SUV Off-Road",4],
  ["Hyundai","Creta","E 1.5 Petrol",1099900,"Petrol NA","1497 CC","Petrol","6-Speed MT","FWD",115,"144 Nm",17.0,180,11.5,false,false,false,false,true,true,false,false,false,false,true,false,true,false,false,false,6,"SUV",5],
  ["Hyundai","Creta","S 1.5 Petrol",1299900,"Petrol NA","1497 CC","Petrol","6-Speed MT","FWD",115,"144 Nm",17.0,180,11.5,false,false,false,true,true,true,false,false,false,true,true,false,true,true,true,true,6,"SUV",5],
  ["Hyundai","Creta","SX 1.5T DCT",1699900,"Petrol Turbo","1482 CC","Petrol","7-Speed DCT","FWD",160,"253 Nm",18.0,185,9.5,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Hyundai","Creta","SX(O) 1.5 Diesel AT",1999900,"Diesel Turbo","1493 CC","Diesel","6-Speed AT","FWD",116,"250 Nm",21.8,185,11.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Hyundai","Venue","E 1.2 Petrol",799000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",83,"114 Nm",17.5,165,14.0,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,2,"SUV Compact",5],
  ["Hyundai","Venue","S(O)+ 1.0T DCT",1199000,"Petrol Turbo","998 CC","Petrol","7-Speed DCT","FWD",120,"172 Nm",18.0,180,10.0,false,true,false,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Hyundai","Venue","SX(O) 1.0T iMT",1279000,"Petrol Turbo","998 CC","Petrol","6-Speed iMT","FWD",120,"172 Nm",18.0,180,10.0,true,true,false,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Hyundai","i20","Magna 1.2",749000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",88,"115 Nm",20.35,175,12.0,false,false,false,false,true,true,false,false,false,false,true,false,true,false,false,false,2,"Hatchback",5],
  ["Hyundai","i20","Asta(O) 1.0T DCT",1159000,"Petrol Turbo","998 CC","Petrol","7-Speed DCT","FWD",120,"172 Nm",20.0,185,9.5,true,true,false,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"Hatchback",5],
  ["Hyundai","Verna","EX 1.5 MT",1099000,"Petrol NA","1497 CC","Petrol","6-Speed MT","FWD",115,"144 Nm",19.0,190,11.0,false,false,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"Sedan",5],
  ["Hyundai","Verna","SX(O) 1.5T DCT",1749000,"Petrol Turbo","1482 CC","Petrol","7-Speed DCT","FWD",160,"253 Nm",18.0,195,9.2,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"Sedan",5],
  ["Hyundai","Tucson","Signature 2.0D AT AWD",3499000,"Diesel Turbo","1995 CC","Diesel","8-Speed AT","AWD",186,"416 Nm",14.0,195,9.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Hyundai","Tucson","Platinum 2.0 Petrol AT",2999000,"Petrol NA","1999 CC","Petrol","6-Speed AT","FWD",156,"192 Nm",12.5,195,10.0,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Hyundai","Exter","EX 1.2 MT",599000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",83,"114 Nm",19.2,160,14.5,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,2,"SUV Micro",5],
  ["Hyundai","Exter","SX(O)+ Connect AMT",1049000,"Petrol NA","1197 CC","Petrol","AMT","FWD",83,"114 Nm",19.2,160,14.5,true,false,false,true,true,true,false,false,false,true,true,false,true,true,true,true,6,"SUV Micro",5],
  ["Tata","Nexon","Smart 1.2 MT",849000,"Petrol Turbo","1199 CC","Petrol","6-Speed MT","FWD",120,"170 Nm",17.4,180,10.5,false,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,2,"SUV Compact",5],
  ["Tata","Nexon","Creative+ 1.2T AMT",1149000,"Petrol Turbo","1199 CC","Petrol","AMT","FWD",120,"170 Nm",17.4,180,10.5,true,true,false,true,true,true,false,false,false,true,true,false,true,true,true,true,6,"SUV Compact",5],
  ["Tata","Nexon","Fearless+ 1.5D AMT",1449000,"Diesel Turbo","1497 CC","Diesel","AMT","FWD",115,"260 Nm",23.2,180,11.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Tata","Punch","Pure MT",610000,"Petrol NA","1199 CC","Petrol","5-Speed MT","FWD",86,"113 Nm",18.97,160,14.0,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"SUV Micro",5],
  ["Tata","Punch","Adventure+ AMT",849000,"Petrol NA","1199 CC","Petrol","AMT","FWD",86,"113 Nm",18.97,160,14.0,false,false,false,true,true,false,false,false,false,true,false,false,false,false,false,true,2,"SUV Micro",5],
  ["Tata","Punch","Creative+ AMT",999000,"Petrol NA","1199 CC","Petrol","AMT","FWD",86,"113 Nm",18.97,160,14.0,true,false,false,true,true,true,false,false,false,true,true,false,true,true,true,true,6,"SUV Micro",5],
  ["Tata","Harrier","Smart Diesel MT",1549000,"Diesel Turbo","1956 CC","Diesel","6-Speed MT","FWD",170,"350 Nm",16.8,190,10.0,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",5],
  ["Tata","Harrier","Fearless+ AT",2499000,"Diesel Turbo","1956 CC","Diesel","6-Speed AT","FWD",170,"350 Nm",14.6,190,9.8,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Tata","Safari","Smart Diesel MT",1699000,"Diesel Turbo","1956 CC","Diesel","6-Speed MT","FWD",170,"350 Nm",14.5,190,10.2,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",7],
  ["Tata","Safari","Fearless+ AT",2699000,"Diesel Turbo","1956 CC","Diesel","6-Speed AT","FWD",170,"350 Nm",14.0,190,10.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",7],
  ["Tata","Curvv","Smart 1.2T MT",1049000,"Petrol Turbo","1199 CC","Petrol","6-Speed MT","FWD",125,"225 Nm",17.0,185,10.0,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV Coupe",5],
  ["Tata","Curvv","Accomplished+ 1.5D AT",1899000,"Diesel Turbo","1497 CC","Diesel","7-Speed DCT","FWD",115,"260 Nm",20.5,190,10.5,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Coupe",5],
  ["Tata","Curvv EV","Creative+ 45",1799000,"Electric Motor","NA (Electric)","Electric","Single-Speed Auto","FWD",167,"215 Nm",502,160,8.6,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Coupe",5],
  ["Tata","Curvv EV","Empowered+ 55",2199000,"Electric Motor","NA (Electric)","Electric","Single-Speed Auto","FWD",167,"215 Nm",585,160,8.6,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Coupe",5],
  ["Tata","Nexon EV","Creative+ LR",1499000,"Electric Motor","NA (Electric)","Electric","Single-Speed Auto","FWD",143,"215 Nm",465,140,9.0,true,false,false,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Tata","Nexon EV","Fearless+ LR",1799000,"Electric Motor","NA (Electric)","Electric","Single-Speed Auto","FWD",143,"215 Nm",465,140,9.0,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Tata","Altroz","XE MT",699000,"Petrol NA","1199 CC","Petrol","5-Speed MT","FWD",86,"113 Nm",22.07,175,12.5,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"Hatchback",5],
  ["Tata","Altroz","XZ+ 1.2T DCA",1099000,"Petrol Turbo","1199 CC","Petrol","DCA","FWD",110,"170 Nm",18.0,180,10.5,false,true,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"Hatchback",5],
  ["Mahindra","Thar Roxx","MX1 Diesel MT",1299000,"Diesel Turbo","2184 CC","Diesel","6-Speed MT","RWD",152,"330 Nm",15.2,180,11.5,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,false,6,"SUV",5],
  ["Mahindra","Thar Roxx","MX5 Diesel AT",1799000,"Diesel Turbo","2184 CC","Diesel","6-Speed AT","RWD",175,"370 Nm",15.2,180,10.0,true,true,false,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Mahindra","Thar Roxx","AX7L Diesel AT 4WD",2249000,"Diesel Turbo","2184 CC","Diesel","6-Speed AT","4WD",175,"370 Nm",15.2,180,10.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Mahindra","XUV700","MX Petrol MT",1399000,"Petrol Turbo","1997 CC","Petrol","6-Speed MT","FWD",200,"380 Nm",13.0,200,8.3,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",5],
  ["Mahindra","XUV700","AX5 Diesel AT",1899000,"Diesel Turbo","2184 CC","Diesel","6-Speed AT","FWD",185,"420 Nm",16.0,200,8.5,true,true,false,true,true,true,false,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Mahindra","XUV700","AX7L Diesel AT AWD",2649000,"Diesel Turbo","2184 CC","Diesel","6-Speed AT","AWD",185,"420 Nm",14.0,200,8.5,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,7,"SUV",7],
  ["Mahindra","XUV 3XO","MX1 1.2T MT",799000,"Petrol Turbo","1197 CC","Petrol","6-Speed MT","FWD",110,"200 Nm",18.0,175,11.0,false,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,2,"SUV Compact",5],
  ["Mahindra","XUV 3XO","AX7L 1.2T AT",1549000,"Petrol Turbo","1197 CC","Petrol","6-Speed AT","FWD",131,"230 Nm",17.0,180,10.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Mahindra","Scorpio-N","Z4 2.0T MT",1399000,"Petrol Turbo","1997 CC","Petrol","6-Speed MT","RWD",200,"380 Nm",12.0,180,9.5,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",7],
  ["Mahindra","Scorpio-N","Z8L 2.2D AT 4WD",2599000,"Diesel Turbo","2184 CC","Diesel","6-Speed AT","4WD",175,"400 Nm",14.0,180,9.5,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",7],
  ["Mahindra","Bolero Neo","N10(O)",1099000,"Diesel Turbo","1493 CC","Diesel","5-Speed MT","RWD",100,"260 Nm",17.0,150,16.0,false,true,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"SUV",7],
  ["Mahindra","BE 6","Pack One",1899000,"Electric Motor","NA (Electric)","Electric","Single-Speed Auto","RWD",286,"380 Nm",556,200,6.7,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Coupe",5],
  ["Kia","Seltos","HTE 1.5 Petrol",1099000,"Petrol NA","1497 CC","Petrol","6-Speed MT","FWD",115,"144 Nm",17.0,175,11.5,false,false,false,false,true,true,false,false,false,false,true,false,true,false,false,false,6,"SUV",5],
  ["Kia","Seltos","HTX+ 1.5T DCT",1699000,"Petrol Turbo","1482 CC","Petrol","7-Speed DCT","FWD",160,"253 Nm",18.0,185,9.5,true,true,false,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Kia","Seltos","X-Line 1.5D AT",1999000,"Diesel Turbo","1493 CC","Diesel","6-Speed AT","FWD",116,"250 Nm",20.7,185,11.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Kia","Sonet","HTE 1.2 Petrol",799000,"Petrol NA","1197 CC","Petrol","5-Speed MT","FWD",83,"114 Nm",17.5,170,14.0,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,2,"SUV Compact",5],
  ["Kia","Sonet","HTX+ 1.0T DCT",1249000,"Petrol Turbo","998 CC","Petrol","7-Speed DCT","FWD",120,"172 Nm",18.0,180,10.0,true,true,false,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Kia","Sonet","X-Line 1.5D AT",1549000,"Diesel Turbo","1493 CC","Diesel","6-Speed AT","FWD",116,"250 Nm",20.6,180,11.5,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Kia","Carens","Premium 1.5 Petrol MT",1049000,"Petrol NA","1497 CC","Petrol","6-Speed MT","FWD",115,"144 Nm",16.5,175,12.0,false,false,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"MPV",7],
  ["Kia","Carens","Luxury+ 1.5D AT",1899000,"Diesel Turbo","1493 CC","Diesel","6-Speed AT","FWD",116,"250 Nm",20.0,185,11.0,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"MPV",7],
  ["Kia","EV6","GT-Line AWD",6499000,"Electric Motor","NA (Electric)","Electric","Single-Speed Auto","AWD",325,"605 Nm",528,185,5.2,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV Crossover",5],
  ["Honda","City","V MT Petrol",1199000,"Petrol NA","1498 CC","Petrol","6-Speed MT","FWD",121,"145 Nm",18.4,190,10.5,false,false,false,true,true,true,false,false,false,true,true,false,true,true,true,true,6,"Sedan",5],
  ["Honda","City","ZX CVT Petrol",1549000,"Petrol NA","1498 CC","Petrol","CVT","FWD",121,"145 Nm",18.4,190,10.0,true,false,true,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"Sedan",5],
  ["Honda","City","ZX eHEV",1999000,"Strong Hybrid","1498 CC","Petrol Hybrid","eCVT","FWD",126,"253 Nm",27.13,175,9.5,true,false,true,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"Sedan",5],
  ["Honda","Elevate","SV MT",1110000,"Petrol NA","1498 CC","Petrol","6-Speed MT","FWD",121,"145 Nm",15.31,185,11.0,false,false,false,true,true,true,false,false,false,false,true,false,true,true,true,false,6,"SUV",5],
  ["Honda","Elevate","ZX CVT",1558000,"Petrol NA","1498 CC","Petrol","CVT","FWD",121,"145 Nm",15.31,185,10.5,true,false,true,true,true,true,false,false,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Honda","Amaze","V MT",799000,"Petrol NA","1199 CC","Petrol","5-Speed MT","FWD",90,"110 Nm",18.6,170,13.0,false,false,false,false,true,true,false,false,false,false,true,false,true,true,false,false,2,"Sedan",5],
  ["Honda","Amaze","VX CVT",999000,"Petrol NA","1199 CC","Petrol","CVT","FWD",90,"110 Nm",18.6,170,13.5,false,false,false,true,true,true,false,false,false,true,true,true,true,true,true,true,6,"Sedan",5],
  ["Toyota","Fortuner","GX MT Diesel",3399000,"Diesel Turbo","2755 CC","Diesel","6-Speed MT","RWD",204,"500 Nm",12.0,195,9.5,false,true,false,true,true,true,false,false,false,false,true,true,true,true,true,true,7,"SUV",7],
  ["Toyota","Fortuner","Legender AT 4x4",4699000,"Diesel Turbo","2755 CC","Diesel","6-Speed AT","4WD",204,"500 Nm",10.0,195,9.5,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,7,"SUV",7],
  ["Toyota","Innova Hycross","GX 8-Seater",1994000,"Petrol NA","1987 CC","Petrol","5-Speed MT","FWD",174,"209 Nm",10.5,180,11.5,false,false,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"MPV",8],
  ["Toyota","Innova Hycross","ZX(O) Hybrid",2893000,"Strong Hybrid","1987 CC","Petrol Hybrid","eCVT","FWD",186,"206 Nm",21.1,175,9.5,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"MPV",7],
  ["Toyota","Urban Cruiser Hyryder","S MT",1099000,"Petrol NA","1462 CC","Petrol","5-Speed MT","FWD",103,"137 Nm",21.1,180,12.0,false,false,false,true,true,true,false,false,false,false,true,false,true,false,true,true,6,"SUV",5],
  ["Toyota","Urban Cruiser Hyryder","V Hybrid AT",1849000,"Strong Hybrid","1490 CC","Petrol Hybrid","eCVT","FWD",116,"122 Nm",27.97,170,11.0,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Skoda","Kushaq","Active 1.0 TSI MT",1149000,"Petrol Turbo","999 CC","Petrol","6-Speed MT","FWD",115,"178 Nm",19.6,185,10.0,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",5],
  ["Skoda","Kushaq","Prestige 1.5 TSI DSG",1799000,"Petrol Turbo","1498 CC","Petrol","7-Speed DSG","FWD",150,"250 Nm",16.6,195,8.8,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Skoda","Slavia","Active 1.0 TSI MT",1149000,"Petrol Turbo","999 CC","Petrol","6-Speed MT","FWD",115,"178 Nm",19.6,195,10.0,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"Sedan",5],
  ["Skoda","Slavia","Prestige 1.5 TSI DSG",1849000,"Petrol Turbo","1498 CC","Petrol","7-Speed DSG","FWD",150,"250 Nm",16.6,200,8.5,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"Sedan",5],
  ["Volkswagen","Taigun","Comfortline 1.0 TSI MT",1199000,"Petrol Turbo","999 CC","Petrol","6-Speed MT","FWD",115,"178 Nm",19.2,185,10.0,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",5],
  ["Volkswagen","Taigun","Topline 1.5 TSI DSG",1849000,"Petrol Turbo","1498 CC","Petrol","7-Speed DSG","FWD",150,"250 Nm",15.6,195,8.8,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Volkswagen","Virtus","Comfortline 1.0 TSI MT",1199000,"Petrol Turbo","999 CC","Petrol","6-Speed MT","FWD",115,"178 Nm",19.4,195,10.0,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"Sedan",5],
  ["Volkswagen","Virtus","Topline 1.5 TSI DSG",1899000,"Petrol Turbo","1498 CC","Petrol","7-Speed DSG","FWD",150,"250 Nm",15.6,205,8.5,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"Sedan",5],
  ["MG Motor","Hector","Style 1.5T MT",1399000,"Petrol Turbo","1451 CC","Petrol","6-Speed MT","FWD",143,"250 Nm",14.5,185,10.0,false,true,false,true,true,true,false,false,false,true,true,false,true,true,true,true,6,"SUV",5],
  ["MG Motor","Hector","Sharp Pro 1.5T CVT",2099000,"Petrol Turbo","1451 CC","Petrol","CVT","FWD",143,"250 Nm",13.5,185,10.5,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["MG Motor","Hector","Savvy 2.0D AT",2199000,"Diesel Turbo","1956 CC","Diesel","6-Speed AT","FWD",170,"350 Nm",14.0,185,10.0,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,6,"SUV",7],
  ["MG Motor","Astor","Style 1.5 MT",999900,"Petrol NA","1498 CC","Petrol","5-Speed MT","FWD",110,"144 Nm",15.5,175,12.0,false,false,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV Compact",5],
  ["MG Motor","Astor","Savvy 1.3T AT",1599900,"Petrol Turbo","1349 CC","Petrol","6-Speed AT","FWD",140,"220 Nm",15.0,185,9.5,true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV Compact",5],
  ["Renault","Duster","RXS 1.3T MT",1049000,"Petrol Turbo","1330 CC","Petrol","6-Speed MT","FWD",155,"254 Nm",17.5,190,9.5,false,true,false,true,true,true,false,false,false,false,true,false,true,true,true,true,6,"SUV",5],
  ["Renault","Duster","RXZ 1.3T CVT",1599000,"Petrol Turbo","1330 CC","Petrol","CVT","FWD",155,"254 Nm",16.5,190,10.0,true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV",5],
  ["Citroen","Basalt","You MT",799000,"Petrol Turbo","1199 CC","Petrol","6-Speed MT","FWD",110,"190 Nm",18.5,180,10.5,false,true,false,true,true,true,false,false,false,false,true,false,true,true,false,false,6,"SUV Coupe",5],
  ["Citroen","Basalt","Max AT",1199000,"Petrol Turbo","1199 CC","Petrol","6-Speed AT","FWD",110,"190 Nm",17.0,180,10.5,false,true,false,true,true,true,true,false,true,true,true,true,true,true,true,true,6,"SUV Coupe",5],
  ["Nissan","Magnite","XE MT",599000,"Petrol NA","999 CC","Petrol","5-Speed MT","FWD",72,"96 Nm",18.75,155,15.0,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,2,"SUV Compact",5],
  ["Nissan","Magnite","XV Premium 1.0T CVT",1099000,"Petrol Turbo","999 CC","Petrol","CVT","FWD",100,"152 Nm",17.4,170,11.0,false,true,false,true,true,true,true,false,true,true,true,true,true,true,true,true,4,"SUV Compact",5],
];

function toId(brand, model, variant) {
  return `${brand}-${model}-${variant}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function buildSafetyFeatures(r) {
  const f = [];
  if (r[30] > 0) f.push(`${r[30]} Airbags`);
  if (r[18]) f.push("ABS with EBD");
  if (r[19]) f.push("ESP/ESC");
  if (r[20]) f.push("360° Camera");
  if (r[16]) f.push("ADAS Level 2");
  if (r[26]) f.push("TPMS");
  if (r[27]) f.push("Hill Assist");
  if (r[28]) f.push("ISOFIX");
  return f.length >= 3 ? f : [...f, "Seatbelt Reminder", "Rear Parking Sensors", "ABS"].slice(0, 3);
}

function buildComfortFeatures(r) {
  const f = [];
  if (r[14]) f.push("Sunroof");
  if (r[21]) f.push("Ventilated Seats");
  if (r[29]) f.push("Push Button Start");
  if (r[22]) f.push("Wireless Charger");
  if (r[25]) f.push("Cruise Control");
  if (f.length < 3) f.push("Height Adjustable Seat", "Rear AC Vents", "Tilt Steering");
  return f.slice(0, 5);
}

function buildTechFeatures(r) {
  const f = [];
  if (r[23]) f.push("Connected Car Tech");
  if (r[24]) f.push("LED Headlamps");
  f.push("Touchscreen Infotainment");
  f.push("Wireless CarPlay/Android Auto");
  if (f.length < 3) f.push("Digital Cluster");
  return f.slice(0, 5);
}

function buildExteriorFeatures(r) {
  const f = [];
  if (r[17]) f.push("Alloy Wheels");
  if (r[24]) f.push("LED Headlamps");
  f.push("Body-Colored Door Handles");
  f.push("Shark Fin Antenna");
  return f.slice(0, 4);
}

function buildRatings(r) {
  const hp = r[9]; const mileage = r[11]; const price = r[3];
  const perf = Math.min(10, Math.max(5, 5 + (hp - 80) / 40));
  const fuel = Math.min(10, Math.max(5, 5 + (mileage - 12) / 4));
  const safety = r[30] >= 6 ? (r[16] ? 9.5 : 8.5) : (r[30] >= 4 ? 7.5 : 6.0);
  const comfort = (r[14] ? 1.5 : 0) + (r[21] ? 1 : 0) + (r[29] ? 0.5 : 0) + 5.5;
  const tech = (r[23] ? 1.5 : 0) + (r[24] ? 1 : 0) + 5.5;
  const value = Math.min(10, Math.max(5, 10 - price / 500000));
  return {
    performance: +perf.toFixed(1),
    fuelEfficiency: +fuel.toFixed(1),
    safety: +Math.min(10, safety).toFixed(1),
    comfort: +Math.min(10, comfort).toFixed(1),
    technology: +Math.min(10, tech).toFixed(1),
    valueForMoney: +value.toFixed(1),
  };
}

// Group variants by brand+model
const CDN = "https://imgd.aeplcdn.com/664x374/n/cw/ec";
const carImages = {
  "Maruti Suzuki|Swift": `${CDN}/159099/Maruti-Swift-Exterior-166164.jpeg`,
  "Maruti Suzuki|Baleno": `${CDN}/114455/Maruti-Baleno-Exterior-166165.jpeg`,
  "Maruti Suzuki|Dzire": `${CDN}/176277/Maruti-Dzire-Exterior-166167.jpeg`,
  "Maruti Suzuki|Brezza": `${CDN}/107543/Maruti-Brezza-Exterior-166166.jpeg`,
  "Maruti Suzuki|Grand Vitara": `${CDN}/117536/Maruti-Grand-Vitara-Exterior-166170.jpeg`,
  "Maruti Suzuki|Ertiga": `${CDN}/53065/Maruti-Ertiga-Exterior-166168.jpeg`,
  "Maruti Suzuki|XL6": `${CDN}/93545/Maruti-XL6-Exterior-166171.jpeg`,
  "Maruti Suzuki|Fronx": `${CDN}/127756/Maruti-Fronx-Exterior-166169.jpeg`,
  "Maruti Suzuki|Jimny": `${CDN}/126491/Maruti-Jimny-Exterior-166172.jpeg`,
  "Hyundai|Creta": `${CDN}/170525/Hyundai-Creta-Exterior-166113.jpeg`,
  "Hyundai|Venue": `${CDN}/112518/Hyundai-Venue-Exterior-166118.jpeg`,
  "Hyundai|i20": `${CDN}/80531/Hyundai-i20-Exterior-166114.jpeg`,
  "Hyundai|Verna": `${CDN}/137548/Hyundai-Verna-Exterior-166119.jpeg`,
  "Hyundai|Tucson": `${CDN}/124014/Hyundai-Tucson-Exterior-166117.jpeg`,
  "Hyundai|Exter": `${CDN}/139651/Hyundai-Exter-Exterior-166112.jpeg`,
  "Tata|Nexon": `${CDN}/139651/Tata-Nexon-Exterior-166183.jpeg`,
  "Tata|Punch": `${CDN}/175939/Tata-Punch-Exterior-166184.jpeg`,
  "Tata|Harrier": `${CDN}/175465/Tata-Harrier-Exterior-166181.jpeg`,
  "Tata|Safari": `${CDN}/175465/Tata-Safari-Exterior-166186.jpeg`,
  "Tata|Curvv": `${CDN}/170525/Tata-Curvv-Exterior-166180.jpeg`,
  "Tata|Curvv EV": `${CDN}/139651/curvv-ev-exterior-right-front-three-quarter.jpeg`,
  "Tata|Nexon EV": `${CDN}/139651/Tata-Nexon-EV-Exterior-166185.jpeg`,
  "Tata|Altroz": `${CDN}/80531/Tata-Altroz-Exterior-166179.jpeg`,
  "Mahindra|Thar Roxx": `${CDN}/170525/Mahindra-Thar-ROXX-Exterior-166145.jpeg`,
  "Mahindra|XUV700": `${CDN}/110502/Mahindra-XUV700-Exterior-166149.jpeg`,
  "Mahindra|XUV 3XO": `${CDN}/170525/Mahindra-XUV-3XO-Exterior-166148.jpeg`,
  "Mahindra|Scorpio-N": `${CDN}/127756/Mahindra-Scorpio-N-Exterior-166146.jpeg`,
  "Mahindra|Bolero Neo": `${CDN}/53065/Mahindra-Bolero-Neo-Exterior-166143.jpeg`,
  "Mahindra|BE 6": `${CDN}/170525/Mahindra-BE-6-Exterior-166142.jpeg`,
  "Kia|Seltos": `${CDN}/170525/Kia-Seltos-Exterior-166128.jpeg`,
  "Kia|Sonet": `${CDN}/112518/Kia-Sonet-Exterior-166129.jpeg`,
  "Kia|Carens": `${CDN}/117536/Kia-Carens-Exterior-166126.jpeg`,
  "Kia|EV6": `${CDN}/124014/Kia-EV6-Exterior-166127.jpeg`,
  "Honda|City": `${CDN}/93545/Honda-City-Exterior-166103.jpeg`,
  "Honda|Elevate": `${CDN}/139651/Honda-Elevate-Exterior-166104.jpeg`,
  "Honda|Amaze": `${CDN}/176277/Honda-Amaze-Exterior-166102.jpeg`,
  "Toyota|Fortuner": `${CDN}/80531/Toyota-Fortuner-Exterior-166190.jpeg`,
  "Toyota|Innova Hycross": `${CDN}/137548/Toyota-Innova-HyCross-Exterior-166192.jpeg`,
  "Toyota|Urban Cruiser Hyryder": `${CDN}/117536/Toyota-Urban-Cruiser-Hyryder-Exterior-166194.jpeg`,
  "Skoda|Kushaq": `${CDN}/117536/Skoda-Kushaq-Exterior-166175.jpeg`,
  "Skoda|Slavia": `${CDN}/114455/Skoda-Slavia-Exterior-166176.jpeg`,
  "Volkswagen|Taigun": `${CDN}/117536/Volkswagen-Taigun-Exterior-166197.jpeg`,
  "Volkswagen|Virtus": `${CDN}/114455/Volkswagen-Virtus-Exterior-166198.jpeg`,
  "MG Motor|Hector": `${CDN}/110502/MG-Hector-Exterior-166155.jpeg`,
  "MG Motor|Astor": `${CDN}/112518/MG-Astor-Exterior-166153.jpeg`,
  "Renault|Duster": `${CDN}/176277/Renault-Duster-Exterior-166173.jpeg`,
  "Citroen|Basalt": `${CDN}/170525/Citroen-Basalt-Exterior-166095.jpeg`,
  "Nissan|Magnite": `${CDN}/112518/Nissan-Magnite-Exterior-166159.jpeg`,
};

const modelGroups = {};
for (const r of rows) {
  const key = `${r[0]}|${r[1]}`;
  if (!modelGroups[key]) modelGroups[key] = [];
  modelGroups[key].push(r);
}

const cars = [];
for (const [key, variants] of Object.entries(modelGroups)) {
  const base = variants[0];
  const midVariant = variants[Math.floor(variants.length / 2)];
  const emoji = base[6] === "Electric" ? "⚡" : base[6] === "Diesel" ? "🏋️" : "🚗";

  const car = {
    id: toId(base[0], base[1], ""),
    name: `${base[0]} ${base[1]}`,
    brand: base[0],
    model: base[1],
    year: 2025,
    price: base[3],
    currency: "INR",
    category: base[31],
    imageEmoji: emoji,
    imageUrl: carImages[key] || `/images/cars/placeholder-car.svg`,
    gallery: carImages[key] ? [carImages[key]] : [],
    color: brands.find(b => b.name === base[0])?.color || "#6B7280",
    specs: {
      engine: midVariant[4],
      horsepower: midVariant[9],
      torque: String(midVariant[10]),
      transmission: midVariant[7],
      drivetrain: midVariant[8],
      fuelType: midVariant[6],
      mileage: midVariant[11],
      acceleration: midVariant[13],
      topSpeed: midVariant[12],
    },
    features: {
      safety: buildSafetyFeatures(midVariant),
      comfort: buildComfortFeatures(midVariant),
      technology: buildTechFeatures(midVariant),
      exterior: buildExteriorFeatures(midVariant),
    },
    ratings: buildRatings(midVariant),
    variants: variants.map(v => ({ name: v[2], price: v[3] })),
    description: `The ${base[0]} ${base[1]} is a popular ${base[31].toLowerCase()} in the Indian market.`,
    bodyType: base[31],
    seatingCapacity: base[32],
  };
  cars.push(car);
}

const dataset = {
  version: "5.0.0",
  lastUpdated: new Date().toISOString(),
  brands,
  cars,
};

writeFileSync("public/data/cars.json", JSON.stringify(dataset, null, 2));
console.log(`Generated cars.json with ${cars.length} cars and ${brands.length} brands`);
