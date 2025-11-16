import { Link } from "react-router-dom";

export default function Home() {
  return(
    <div className="font-sans">

      {/* Banner Image */}
      {/*replace with image of butterfly*/}
      <div 
        className="relative h-[631px] bg-cover bg-center flex"
        style={{
          backgroundImage: "url('/temp_background.png')"
        }}
      >
        {/* light overlay for contrast (might not need depending on image) */}
        <div className="absolute inset-0 bg-white opacity-0"/>

        <div className="relative z-10 mt-20 ml-32 text-left text-black">
          <h1 className="text-5xl text-[#193024] font-bold leading-[58px] max-w-sm mb-6">
            Discover the Butterflies of Colorado’s Front Range
          </h1>
          <p className="text-base leading-[19px] max-w-lg ml-1 mb-8">
            Explore butterflies of Colorado’s Front Range — from the Wyoming border to Pueblo, spanning 
            plains to alpine zones. Photos are shared by butterfly enthusiasts across the region.
          </p>
          <Link to="/wildlife">
            <button className="font-montserrat bg-[#4C6735] text-[#FAF8F4] py-2 px-[19px] rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-green-600 transition-all duration-300">
              See our butterflies
            </button>
          </Link>
        </div>
      </div>

      {/* Website Description */}
      <>
        <p className="leading-[19px] max-w-[1183px] mt-16 ml-32">
          Welcome to this accessible reference and general guide to the butterflies along the 
          Colorado Front Range. For this website, the Colorado Front Range is defined from the 
          Colorado-Wyoming border south to Pueblo, from the Continental Divide to the plains, 
          including the following counties: Larimer, Boulder, Broomfield, Gilpin, Clear Creek, 
          Jefferson, Denver, Douglas, Park, Teller, El Paso, Fremont, and Pueblo. This area 
          encompasses five life zones: plains, foothills, montane, subalpine, and alpine. The 
          website includes photographs collected and contributed by butterfly watchers across 
          the region. 
          <br/> <br/>
          If you have photos to contribute, please contact the 
          {" "} <Link
            to="/contact"
            className="underline hover:text-blue-800"
          >
            webmaster
          </Link>
          .
          <br/> <br/>
          Butterflies are generally listed in taxonomic order by family, genus, and species. 
          Each species account includes photos taken in the Front Range area, a brief description 
          of the butterfly, an indication of wingspan size, known habitat for that species, 
          adult flight time(s), larval food plant, and some extra information. The adult flight 
          time listed in each species account is the most likely time for adults to fly along 
          the Front Range, but flight times can fluctuate due to weather conditions, host plant 
          availability, and/or north-south position along the Front Range region.
        </p>
      </>

      <hr className="bg-[#C7BDAA] border-[#C7BDAA] mx-auto h-[2px] w-[1184px] mt-16" />

      {/* Book Section */}
      <div className="flex items-start gap-[21px] px-32 mt-16">
        <img
          src='/butterfly_book.jpg'
          alt="Book Cover"
          className="w-[280px] rounded-xl object-cover"
        />

        <div>           
          <p className="leading-[19px] max-w-[884px]">
            Tips on where to find butterflies, how to get close to them, how to attract them to your 
            gardens, and preserve their sensitive habitats
            <br/><br/>
            User-friendly guide to 100 frequently seen species along the Colorado Front Range from 
            the Wyoming border to Pueblo
            <br/><br/>
            Over 120 color photos of individuals in their natural setting
            <br/><br/>
            Clear descriptions of males and females, including habitat and life cycle, caterpillar 
            host plants, and look-alike butterflies
            <br/><br/>
            Available in print and eBook format <br/>
            140 pages, 120 color photos, 5x8″             eBook     $5.99          Print     $15.00
            <br/><br/>
            The print book is available through Boulder County Nature Association (
            {/*make link go to email maybe?*/}
            <Link
              to="/contact"
              className="underline hover:text-blue-800"
            >
              books@bcna.org
            </Link>
            ); 
            Front Range Birding Company, 5360 Arapahoe Ave, Boulder CO and 10146 W. San Juan Way, 
            Littleton CO; Wild Birds Unlimited, 2720 S. Wadsworth, Denver CO, and 7370 W. 88th Ave., 
            Arvada CO; Wild Bear Nature Center Gift Shop in Caribou Village Shopping Center, 20 
            Lakeview Drive, Nederland CO; Covered Treasures Bookstore, 105 Second Street, Monument CO
            <br/><br/>
            Paperback and eBook formats are both available from 
            {" "} <a 
              href="https://a.co/d/aN4jL4J"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              Amazon
            </a>
            ; Apple Books (purchase using the 
            Apple Books app); 
            {" "} <a 
              href="https://www.brighamdistributing.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              Brigham Distributing
            </a>
            ; some Barnes & Noble stores in the Front Range area. 
            The eBook is also available from 
            {" "} <a 
              href="https://www.kobo.com/us/en/ebook/butterflies-of-the-colorado-front-range"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              kobo.com
            </a>
            .
          </p>
          
          {/*update later*/}
          <Link to="/">
            <button className="self-start mt-6 font-montserrat bg-[#4C6735] text-white py-2 px-14 rounded-full shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:bg-green-600 transition-all duration-300">
              Buy here
            </button>
          </Link>
        </div> 

      </div>

      <hr className="bg-[#C7BDAA] border-[#C7BDAA] mx-auto h-[2px] w-[1184px] mt-16" />

      {/* Butterfly Research */}
      <div className="leading-[19px] max-w-[1183px] mt-16 ml-32 mb-20">
        <p>
          Butterfly Surveys have been completed on some Boulder County Open Space properties from 2002 to 
          2024 by Janet R. Chu and her butterfly research team. Boulder County Parks and Open Space (BCPOS) 
          and Boulder County Nature Association (BCNA) have encouraged and partially funded these important 
          surveys with the resulting reports and analyses of trends. BCNA funded the 2007 continuation of a 
          research program to survey Boulder County butterflies and the preparation of a 74-page report. 
          The BCPOS Small Grants Program supported the surveys in 2004-2006. Since then, monitoring of 
          butterflies on Boulder County Open Space properties has been partially funded by the BCPOS and the 
          BCNA Small Grants Programs. Links to later reports (PDF) on the Boulder County website are listed 
          below.
          <br/><br/>
        </p>

        <ul className="list-disc">
          <li>
            <a 
              href="https://bcna.org/wp-content/uploads/2021/07/2004-2007SummaryButterflyReport.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              
              Butterfly Research in Boulder County 2004 - 2007
            </a>
            <br/><br/>
          </li>
          <li>
            <a 
              href="https://bcna.org/library/BCNA%20Butterfly%20Study%202007-11%20.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              Butterflies A Continuing Study of Species and Populations In Boulder County Open Space 
              Properties – 2011 Inventory and 2007-2011 Analyses
            </a>
            <br/><br/>
          </li>
            <a 
              href="https://bcna.org/library/ButterfliesAnnWhiteTrail-Chu.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              Summary report of butterfly observations on the Anne U. White Trail in Boulder County before the 
              September 2013 flood
            </a>
            <br/><br/>
          <li>
            Additional Boulder County butterfly survey reports for the following years are published on the
            {" "} <a 
              href="https://bouldercounty.gov/open-space/education/research/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
              Boulder County website
            </a>
            . <br/>
            {/*add links for each date*/}
            (
            <>
              <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2002Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2002</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2003Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2003</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2004Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2004</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2005Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2005</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2006Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2006</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2008Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2008</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2009Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2009</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2010Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2010</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2011Chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2011</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2017/03/research-report-2013chu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2013</a>
              ;
              {" "} <a 
                href="https://assets.bouldercounty.gov/wp-content/uploads/2019/01/butterfly-inventories-2018.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-800"
              >2018</a>
            </>
            ).
            <br/><br/>
            Butterfly Counts have been held at the Cal-Wood Education Center every July 4 for 40 years, 
            1984-2024. Cal-Wood is a registered nonprofit that connects children and adults to the 
            Colorado mountains through environmental education, service, and recreation and is located near 
            Jamestown, Colorado. A 29-page report on the Cal-Wood butterfly counts covering 1984 to 2014 is 
            available as a PDF (3.8 MB).
            <br/><br/>
          </li>
          <li>
            <a 
              href="https://bcna.org/butterflyreport1984-2014.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
            Cal-wood Fourth of July Butterfly Counts, 1984-2014
            </a>
            <br/><br/>
            The field guides, Butterflies of the Colorado Front Range, 1st and 2nd editions, by 
            Janet R. Chu and Stephen R. Jones, stem from research partially supported by the 
            Boulder County Nature Association. <br/>
            Boulder County Nature Association (BCNA) is the host and sponsor of this website.
          </li>
        </ul>
      </div>
    </div>
  );
  }