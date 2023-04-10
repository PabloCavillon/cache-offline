//const CACHE_NAME = 'cache-1';

const CACHE_STATIC_NAME = 'static-v2';
const CACHE_DYNAMIC_NAME = 'dynamic-v1';

const CACHE_INMUTABLE_NAME = 'inmutable-v1';

const CACHE_DYNAMIC_LIMIT = 50;

function limpiarCache( cacheName, numeroItems){

    caches.open( cacheName )
        .then( cache => {

            return cache.keys()
                .then( keys => {
                    if (keys.length > numeroItems){
                        cache.delete( keys[0] )
                            .then( limpiarCache(cacheName, numeroItems) );
                    }
                });

        });
}



self.addEventListener('install', e => {

    const cacheProm =  caches.open( CACHE_STATIC_NAME )
        .then( cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/img/main.jpg',
                '/js/app.js',
                '/img/no-img.jpg'
            ]);
        });

    const cacheInmutable = caches.open( CACHE_INMUTABLE_NAME )
        .then( cache => cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'));
    
    e.waitUntil( Promise.all([cacheProm, cacheInmutable]) );
});



//Estrategias del cache
self.addEventListener('fetch', e => {

    //5- Cache y Network race

    const respuesta = new Promise( (resolve, reject) => {

        let rechazada = false;
        const falloUnaVez = () => {

            if ( rechazada ){
                if(/\.(png|jpg)$/i.test( e.request.url )){
                    resolve( caches.match( '/img/no-img.jpg' ) );
                } else {
                    reject('No se encontró respuesta');
                }
            } else {
                rechazada = true;
            }

        };

        fetch( e.request ).then( res => {
                res.ok ? resolve(res) : falloUnaVez();
        }).catch( falloUnaVez );

        caches.match( e.request ).then( res => {
            res ? resolve(res) : falloUnaVez();
        }).catch( falloUnaVez );

    });



    e.respondWith(respuesta);

    //4- Cache with network update -> util cuando el rendimiento en critico, 
    //las acutalizaciones siempre estarn una version atras

    /*if ( e.request.url.includes('bootstrap') ){
        return e.respondWith( caches.match( e.request ) );
    }

    const resp = caches.open( CACHE_STATIC_NAME )
        .then( cache => {
            fetch( e.request )
                .then( newResp => cache.put(e.request, newResp));
            
            return cache.match( e.request ); 
        });

    e.respondWith(resp);*/

    //3- Network With Cache Fallback -> primero busca en internet y sino lo encuentra lo busca en el cache

    /*const resp = fetch( e.request )
        .then( resp => {

            if ( !resp ) return caches.match( e.request );

            caches.open( CACHE_DYNAMIC_NAME )
                .then( cache => {
                    cache.put(e.request, resp);
                    limpiarCache( CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT );
                });

            return resp.clone();

        }).catch( err => {

            return caches.match( e.request ); 

        });

    e.respondWith( resp );*/



    //2- Cache with Network Fallback -> Intenta en el cache y sino fetch a internet

    /*const resp = caches.match( e.request )
        .then( resp => {

            if( resp ) return resp;

            //No existe el archivo -> tengo que ir a la web

            console.log('No existe', e.request.url);

            return fetch( e.request )
                .then( newResp => {

                    caches.open( CACHE_DYNAMIC_NAME )
                        .then( cache => {
                            cache.put( e.request, newResp );
                            limpiarCache( CACHE_DYNAMIC_NAME, 5);
                        });

                    return newResp.clone();
                });
        });

    e.respondWith( resp );*/

    //1- cache only -> cuando queremos que toda la aplicacion sea servida desde el cache
    //No hay peticion que salga de la web

    //e.respondWith( caches.match( e.request ) );
});