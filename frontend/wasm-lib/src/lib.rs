use wasm_bindgen::prelude::*;
use rand::prelude::*;




#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn add(left: i32, right: i32) -> i32 {
    left + right
}

// What the typescript receives is an array of velocities
#[wasm_bindgen]
struct ParticleWorld {
    height: f32,
    width: f32,
    particles: Vec<Particle>,
    grid: Vec<Vec<f32>>,
    smoothing_radius: f32,
}

#[wasm_bindgen]
struct Particle {
    y: f32,
    x: f32,
    dy: f32,
    dx: f32,
}

#[wasm_bindgen]
impl ParticleWorld{

    #[wasm_bindgen(constructor)]
    pub fn new(height: f32, width: f32, amount_particles: usize, smoothing_radius: f32, n: usize, m: usize) -> ParticleWorld {
        console_log!("amount balls: {amount_particles}");
        let mut rng = rand::rng();
        let mut particles: Vec<Particle> = vec![];
        for _ in 0..amount_particles {
            particles.push( Particle {
                y: rng.random_range(0.0..height),
                x: rng.random_range(0.0..width),
                dy: 0.,
                dx: 0.,
            });
        }

        ParticleWorld { height, width, particles, grid: vec![ vec![0.; m]; n], smoothing_radius }
    }

    pub fn tick(&mut self, dt: f32) {
        // self.calculate_grid();
        // self.calculate_directions(dt);
        for particle in &mut self.particles {
            Self::collission_detection(particle, self.height, self.width);
            Self::apply_gravity(particle, dt);
            Self::apply_velocity(particle, dt);
        }
    }

    fn apply_gravity(p: &mut Particle, dt: f32) {
        p.dy -= 600. * dt;
    }

    fn apply_velocity(p: &mut Particle, dt: f32) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;
    }

    fn collission_detection(p: &mut Particle, h: f32, w: f32) {
        if p.y <= 0. { p.dy *= -1.; p.y = 0.; }
        if p.y >= h { p.dy *= -1.; p.y = h; }
        if p.x <= 0. { p.dx *= -1.; p.x = 0.; }
        if p.x >= w { p.dx *= -1.; p.x = w; }
    }

    fn calculate_r(y1: f32, y2: f32, x1: f32, x2: f32) -> f32 {
        let dis_y = y1 - y2;
        let dis_x = x1 - x2;
        (dis_y * dis_y + dis_x * dis_x).sqrt()
    }

    fn calculate_direction_vector(p: &Particle, y: f32, x: f32) -> (f32, f32) {
        (y - p.y, x - p.x)
    }

    fn calculate_gradient(&self, y: f32, x: f32) -> (f32, f32) {
        let step_size = 0.001;

        let density_here = self.calculate_density(y, x);
        let delta_y = self.calculate_density(y + step_size, x) - density_here;
        let delta_x = self.calculate_density(y, x + step_size) - density_here;

        (delta_y / step_size, delta_x / step_size)
    }

    fn calculate_density(&self, y: f32, x: f32) -> f32 {
        let mut density = 0.;
        let mass = 1.;

        for p in &self.particles {
            let dist = Self::calculate_r(p.y, p.x, y, x);
            let influence = self.poly6(dist);
            density += influence * mass;
        }

        density
    }

    fn poly6(&self, r: f32) -> f32 {
        if r > self.smoothing_radius { 0. } else { 4. / (3.14 * self.smoothing_radius.powi(8)) * (self.smoothing_radius.powi(2) - r.powi(2)).powi(3) }
    }

    pub fn positions(&self, buf: &mut [f32]) {
        for (i, p) in self.particles.iter().enumerate() {
            buf[2 * i] = p.x;
            buf[2 * i + 1] = self.height - p.y;
        }
    }

    pub fn velocities(&self, buf: &mut [f32]) {
        for (i, p) in self.particles.iter().enumerate() {
            buf[2 * i] = p.dx;
            buf[2 * i + 1] = -p.dy;
        }
    }



}


#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[wasm_bindgen_test]
    fn particle_world_initialisation() {
        let h = 1;
        let w = 2;
        let am = 3;
        let r = 5.;
        let world = ParticleWorld::new(h, w, am, r);
        assert_eq!(h, world.height);
        assert_eq!(w, world.width);
        assert_eq!(am, world.particles.len());
    }

    #[wasm_bindgen_test]
    fn particles_within_boundaries() {
        let h = 1;
        let w = 2;
        let am = 10;
        let r = 5.;
        let world = ParticleWorld::new(h, w, am, r);
        for p in world.particles {
            assert!(0. <= p.y && p.y <= world.height as f32);
            assert!(0. <= p.x && p.x <= world.width as f32);
            assert_eq!(p.r, r);
        }
    }

}


