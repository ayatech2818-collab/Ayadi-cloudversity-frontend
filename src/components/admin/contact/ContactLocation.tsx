import { ExternalLink, MapPin } from "lucide-react";

const LOCATIONS = [
  {
    name: "Calicut Office",
    address:
      "Orbits Complex, Jafarkhan Colony Road, Calicut, Kerala, India",
    mapEmbedUrl: process.env.NEXT_PUBLIC_CALICUT_MAP_EMBED_URL!,
    mapUrl: process.env.NEXT_PUBLIC_CALICUT_MAP_URL!,
  },
  {
    name: "Sharjah Office",
    address:
      "Ayadi, Shams Free Zone, Sharjah Media City, Sharjah, UAE",
    mapEmbedUrl:
      "https://www.google.com/maps?q=Ayadi,+Shams+Free+Zone,+Sharjah+Media+City,+Sharjah,+UAE&output=embed",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Ayadi,+Shams+Free+Zone,+Sharjah+Media+City,+Sharjah,+UAE",
  },
  {
    name: "Mangalore Office",
    address:
      "Rahmath Complex Near Spoorthi Polyclinic, Thokkottu, Mangalore",
    mapEmbedUrl:
      "https://www.google.com/maps?q=Rahmath+Complex+Near+Spoorthi+Polyclinic,+Thokkottu,+Mangalore&output=embed",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Rahmath+Complex+Near+Spoorthi+Polyclinic,+Thokkottu,+Mangalore",
  },
];

export default function ContactLocation() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-10 sm:pb-1">
      {/* Heading */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary sm:text-sm">
          Visit Us
        </span>

        <h2 className="mt-1.5 text-2xl font-bold text-gray-900 sm:mt-2 sm:text-3xl">
          Our Locations
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600 sm:mt-3 sm:text-base sm:leading-7">
          Connect with Ayadi Cloudversity or visit one of our
          locations. We are here to help you with your questions
          and enquiries.
        </p>
      </div>

      {/* Locations */}
      <div className="space-y-8">
        {LOCATIONS.map((location) => (
          <div
            key={location.name}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-2xl"
          >
            {/* Location Details */}
            <div className="p-5 sm:p-6">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-md shadow-accent/25 sm:h-11 sm:w-11 sm:rounded-xl">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                    {location.name}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm sm:leading-6">
                    {location.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden border-t border-gray-100 bg-gray-100">
              <iframe
                src={location.mapEmbedUrl}
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${location.name} map`}
              />
            </div>

            {/* Google Maps Link */}
            <div className="p-3.5 sm:p-6">
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:text-primary-hover sm:gap-2 sm:text-sm"
              >
                Open in Google Maps
                <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
